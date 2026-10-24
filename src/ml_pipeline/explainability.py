import os
import sys
import torch
import shap
import pandas as pd
import numpy as np

# Add parent path to import FraudGNN
sys.path.insert(0, os.path.dirname(__file__))
from dp_federated_avg import FraudGNN, build_feature_preprocessors

def generate_nlp_explanation(feature_impact):
    fraud_drivers = [item for item in feature_impact if item[1] > 0]
    if not fraud_drivers:
        return "The system flagged this transaction, but specific risk factors were unclear."

    reasons = []
    for name, impact, val in fraud_drivers[:3]:
        if "Amount" in name:
            reasons.append("an unusually high transaction amount")
        elif "Device_Type" in name and val == 1:
            reasons.append("the use of an unrecognized or suspicious device")
        elif "Merchant_Category" in name and val == 1:
            category = name.split('_')[-1]
            reasons.append(f"a high-risk merchant category ({category})")
        elif "Transaction_Type" in name and val == 1:
            type_name = name.split('_')[-1]
            reasons.append(f"an unexpected transaction ({type_name})")
        elif "State" in name:
            reasons.append("a suspicious geographical location")
        else:
            clean_name = name.replace("_", " ").title()
            reasons.append(f"unusual activity involving {clean_name}")

    if len(reasons) == 1:
        nlp_text = f"This transaction was flagged due to {reasons[0]}."
    elif len(reasons) == 2:
        nlp_text = f"This transaction was flagged due to {reasons[0]} and {reasons[1]}."
    else:
        nlp_text = f"This transaction was flagged due to {reasons[0]}, {reasons[1]}, and {reasons[2]}."

    return nlp_text

def generate_shap_explanations():
    print("Initializing GNN SHAP Explainability Module...")

    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    file_path = os.path.join(base_dir, 'data', 'partitioned_banks', 'bank_1_Nagaland.csv')

    df = pd.read_csv(file_path)
    if 'Transaction_Hour' not in df.columns:
        if 'Transaction_Time' in df.columns:
            df['Transaction_Hour'] = pd.to_datetime(
                df['Transaction_Time'], format='%H:%M:%S', errors='coerce'
            ).dt.hour.fillna(12.0).astype(float)
        else:
            df['Transaction_Hour'] = 12.0

    node_prep, edge_prep, node_feature_names, edge_feature_names = build_feature_preprocessors(df)
    feature_names = node_feature_names + edge_feature_names

    node_num = ['Age', 'Account_Balance']
    node_cat = ['Gender', 'Account_Type', 'State']
    edge_num = ['Transaction_Amount', 'Transaction_Hour']
    edge_cat = ['Transaction_Type', 'Merchant_Category', 'Device_Type']

    node_enc = np.asarray(node_prep.transform(df[node_num + node_cat]))
    edge_enc = np.asarray(edge_prep.transform(df[edge_num + edge_cat]))
    X_encoded = np.hstack([node_enc, edge_enc])
    y = df['Is_Fraud'].values

    X_tensor = torch.FloatTensor(X_encoded)

    # Load / initialize FraudGNN model
    model = FraudGNN(node_dim=int(node_enc.shape[1]), edge_dim=int(edge_enc.shape[1]))
    
    weights_path = os.path.join(base_dir, "models", "global_weights.pth")
    if os.path.exists(weights_path):
        try:
            model.load_state_dict(torch.load(weights_path, map_location="cpu"))
            print(f"Loaded trained GNN weights from {weights_path}")
        except Exception as e:
            print(f"Using initialized GNN weights: {e}")
            
    model.eval()

    # Background data: 50 normal transactions
    y_arr = np.asarray(y)
    normal_idx = np.where(y_arr == 0)[0][:50]
    background_data = X_tensor[normal_idx]

    # Fraud transactions to explain
    fraud_idx = np.where(y_arr == 1)[0]
    if len(fraud_idx) == 0:
        print("No fraud cases found in this sample.")
        return

    # Use GradientExplainer — fully compatible with FraudGNN forward pass
    explainer = shap.GradientExplainer(model, background_data.numpy())

    # Explain the first 5 fraud transactions
    targets = X_tensor[fraud_idx[:5]]
    shap_values = explainer.shap_values(targets)

    sv_matrix = np.array(shap_values[0] if isinstance(shap_values, list) else shap_values)
    if sv_matrix.ndim > 2:
        sv_matrix = sv_matrix.reshape(sv_matrix.shape[0], -1)

    # Report for the first fraud transaction
    sv_flat = sv_matrix[0].flatten()
    val_flat = np.array(X_encoded[fraud_idx[0]]).flatten()

    feature_impact = [(name, float(imp), float(val))
                      for name, imp, val in zip(feature_names, sv_flat, val_flat)]
    feature_impact.sort(key=lambda x: abs(x[1]), reverse=True)

    print(f"\n--- Explaining Transaction #{fraud_idx[0]} (True Label: FRAUD) with FraudGNN ---")
    print(f"{'Feature':<35} | {'SHAP Impact':>12} | {'Actual Value':>12}")
    print("-" * 70)
    for name, impact, val in feature_impact[:10]:
        direction = "[->FRAUD]" if impact > 0 else "[->SAFE] "
        print(f"{name:<35} | {impact:>+12.4f} {direction} | {val:>12.4f}")

    print("\n--- NLP Summary ---")
    nlp_summary = generate_nlp_explanation(feature_impact)
    print(nlp_summary)

    print("\nGNN SHAP Explainability completed successfully.")

if __name__ == "__main__":
    generate_shap_explanations()
