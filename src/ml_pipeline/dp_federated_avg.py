import os
import glob
import copy
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from imblearn.over_sampling import SMOTE
from opacus import PrivacyEngine

# Define the DNN Model
class FraudDNN(nn.Module):
    def __init__(self, input_dim):
        super(FraudDNN, self).__init__()
        self.fc1 = nn.Linear(input_dim, 64)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(64, 32)
        self.fc3 = nn.Linear(32, 1)
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        out = self.fc1(x)
        out = self.relu(out)
        out = self.fc2(out)
        out = self.relu(out)
        out = self.fc3(out)
        return self.sigmoid(out)

def load_and_preprocess_bank_data(file_path):
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
    
    smote = SMOTE(random_state=42)
    X_resampled, y_resampled = smote.fit_resample(X_encoded, y)
    
    X_train, X_test, y_train, y_test = train_test_split(X_resampled, y_resampled, test_size=0.2, random_state=42, stratify=y_resampled)
    
    X_train_t = torch.FloatTensor(X_train)
    y_train_t = torch.FloatTensor(y_train).unsqueeze(1)
    X_test_t = torch.FloatTensor(X_test)
    y_test_t = torch.FloatTensor(y_test).unsqueeze(1)
    
    train_dataset = TensorDataset(X_train_t, y_train_t)
    test_dataset = TensorDataset(X_test_t, y_test_t)
    
    return train_dataset, test_dataset, X_encoded.shape[1]

def client_update_dp(client_model, optimizer, train_loader, privacy_engine, epochs=3):
    """Trains the local client model with Differential Privacy."""
    client_model.train()
    criterion = nn.BCELoss()
    for epoch in range(epochs):
        for data, target in train_loader:
            optimizer.zero_grad()
            output = client_model(data)
            loss = criterion(output, target)
            loss.backward()
            optimizer.step()
            
    # Calculate privacy spent
    epsilon = privacy_engine.get_epsilon(delta=1e-5)
    return client_model.state_dict(), epsilon

def server_aggregate(global_model, client_weights):
    global_dict = global_model.state_dict()
    for k in global_dict.keys():
        global_dict[k] = torch.stack([client_weights[i][k].float() for i in range(len(client_weights))], 0).mean(0)
    global_model.load_state_dict(global_dict)
    return global_model

def evaluate_model(model, test_loader):
    model.eval()
    all_targets, all_preds, all_probs = [], [], []
    with torch.no_grad():
        for data, target in test_loader:
            probs = model(data)
            preds = (probs > 0.5).float()
            all_targets.extend(target.numpy())
            all_preds.extend(preds.numpy())
            all_probs.extend(probs.numpy())
            
    acc = accuracy_score(all_targets, all_preds)
    f1 = f1_score(all_targets, all_preds)
    auc = roc_auc_score(all_targets, all_probs)
    return acc, f1, auc

def run_federated_dp_learning():
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    partitioned_dir = os.path.join(base_dir, 'data', 'partitioned_banks')
    bank_files = glob.glob(os.path.join(partitioned_dir, 'bank_*.csv'))
    
    clients_train_ds = []
    clients_test_loaders = []
    input_dim = 0
    
    for file in bank_files:
        train_ds, test_ds, idim = load_and_preprocess_bank_data(file)
        input_dim = idim
        clients_train_ds.append(train_ds)
        clients_test_loaders.append(DataLoader(test_ds, batch_size=64, shuffle=False))
        
    global_model = FraudDNN(input_dim)
    
    num_rounds = 5
    epochs_per_round = 3
    
    print("\n--- Starting Differential Privacy Federated Training (DP-SGD) ---")
    for round_num in range(1, num_rounds + 1):
        print(f"\n[Round {round_num}]")
        client_weights = []
        epsilons = []
        
        for i in range(len(clients_train_ds)):
            client_model = FraudDNN(input_dim)
            client_model.load_state_dict(global_model.state_dict())
            
            optimizer = optim.Adam(client_model.parameters(), lr=0.001)
            train_loader = DataLoader(clients_train_ds[i], batch_size=64, shuffle=True)
            
            # Attach PrivacyEngine for DP-SGD
            privacy_engine = PrivacyEngine()
            client_model, optimizer, train_loader = privacy_engine.make_private(
                module=client_model,
                optimizer=optimizer,
                data_loader=train_loader,
                noise_multiplier=1.0, 
                max_grad_norm=1.2,
            )
            
            weights, eps = client_update_dp(client_model, optimizer, train_loader, privacy_engine, epochs=epochs_per_round)
            
            # Remove opacus wrapper from weights for clean aggregation
            clean_weights = {k.replace('_module.', ''): v for k, v in weights.items()}
            client_weights.append(copy.deepcopy(clean_weights))
            epsilons.append(eps)
            
            print(f"  Bank {i+1} local training | Privacy budget spent: epsilon = {eps:.2f}")
            
        global_model = server_aggregate(global_model, client_weights)
        
        acc, f1, auc = evaluate_model(global_model, clients_test_loaders[0])
        print(f"  Global Model DP Validation - Acc: {acc:.4f} | F1: {f1:.4f} | AUC: {auc:.4f}")
        
    print("\nDP-SGD Training Complete.")

    # ── Save global model weights + preprocessor for Flow B (Edge Inference) ──
    models_dir = os.path.join(base_dir, "models")
    os.makedirs(models_dir, exist_ok=True)

    weights_path = os.path.join(models_dir, "global_weights.pth")
    torch.save(global_model.state_dict(), weights_path)
    print(f"[Flow B] Global weights saved to: {weights_path}")

    # Save input_dim so edge nodes know the model architecture
    import json
    meta = {"input_dim": input_dim, "num_rounds": num_rounds, "dp_epsilon_total": round(sum(epsilons), 4)}
    with open(os.path.join(models_dir, "model_meta.json"), "w") as f:
        json.dump(meta, f, indent=2)
    print(f"[Flow B] Model metadata saved to: {os.path.join(models_dir, 'model_meta.json')}")

    return global_model, input_dim

if __name__ == "__main__":
    run_federated_dp_learning()
