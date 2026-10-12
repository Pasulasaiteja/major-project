import os
import sys
import torch
import shap
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer

# Add parent path to import FraudDNN
sys.path.insert(0, os.path.dirname(__file__))
from mock_federated_avg import FraudDNN

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
    print("Initializing SHAP Explainability Module...")

    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    file_path = os.path.join(base_dir, 'data', 'partitioned_banks', 'bank_1_Nagaland.csv')

    df = pd.read_csv(file_path)
    numeric_features = ['Age', 'Transaction_Amount', 'Account_Balance']
    categorical_features = ['Gender', 'Account_Type', 'Transaction_Type', 'Merchant_Category', 'Device_Type', 'State']

    X = df[numeric_features + categorical_features]
    y = df['Is_Fraud'].values

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features)
        ])

    X_encoded = preprocessor.fit_transform(X)

    # Get feature names
    cat_feature_names = preprocessor.named_transformers_['cat'].get_feature_names_out(categorical_features)
    feature_names = numeric_features + list(cat_feature_names)

    X_tensor = torch.FloatTensor(X_encoded)

    # Load / initialize model
    model = FraudDNN(X_encoded.shape[1])
    model.eval()

    # Background data: 100 normal transactions
    normal_idx = np.where(y == 0)[0][:100]
    background_data = X_tensor[normal_idx]

    # Fraud transactions to explain
    fraud_idx = np.where(y == 1)[0]
    if len(fraud_idx) == 0:
        print("No fraud cases found in this sample.")
        return

    # Use GradientExplainer — fully compatible with PyTorch DNNs
    explainer = shap.GradientExplainer(model, background_data)

    # Explain the first 5 fraud transactions
    targets = X_tensor[fraud_idx[:5]]
    shap_values = explainer.shap_values(targets)

    # sv_matrix may be list-of-arrays or 2D array — normalise to 2D numpy array
    sv_matrix = np.array(shap_values[0] if isinstance(shap_values, list) else shap_values)
    # Ensure shape is (n_samples, n_features) — squeeze out any extra dims
    if sv_matrix.ndim > 2:
        sv_matrix = sv_matrix.reshape(sv_matrix.shape[0], -1)

    # Report for the first fraud transaction — flatten to 1-D before iterating
    sv_flat = sv_matrix[0].flatten()
    val_flat = np.array(X_encoded[fraud_idx[0]]).flatten()

    feature_impact = [(name, float(imp), float(val))
                      for name, imp, val in zip(feature_names, sv_flat, val_flat)]
    feature_impact.sort(key=lambda x: abs(x[1]), reverse=True)

    print(f"\n--- Explaining Transaction #{fraud_idx[0]} (True Label: FRAUD) ---")
    print(f"{'Feature':<35} | {'SHAP Impact':>12} | {'Actual Value':>12}")
    print("-" * 70)
    for name, impact, val in feature_impact[:10]:
        direction = "[->FRAUD]" if impact > 0 else "[->SAFE] "
        print(f"{name:<35} | {impact:>+12.4f} {direction} | {val:>12.4f}")

    print("\n--- NLP Summary ---")
    nlp_summary = generate_nlp_explanation(feature_impact)
    print(nlp_summary)

    print("\nSHAP Explainability completed successfully.")

if __name__ == "__main__":
    generate_shap_explanations()
