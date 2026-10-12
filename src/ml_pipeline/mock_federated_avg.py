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

# Define the DNN Model for the federated clients
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
    print(f"Loading data for {os.path.basename(file_path)}...")
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
    
    # SMOTE to handle class imbalance
    smote = SMOTE(random_state=42)
    X_resampled, y_resampled = smote.fit_resample(X_encoded, y)
    
    # Train/Test Split
    X_train, X_test, y_train, y_test = train_test_split(X_resampled, y_resampled, test_size=0.2, random_state=42, stratify=y_resampled)
    
    # Convert to PyTorch Tensors
    X_train_t = torch.FloatTensor(X_train)
    y_train_t = torch.FloatTensor(y_train).unsqueeze(1)
    X_test_t = torch.FloatTensor(X_test)
    y_test_t = torch.FloatTensor(y_test).unsqueeze(1)
    
    train_dataset = TensorDataset(X_train_t, y_train_t)
    test_dataset = TensorDataset(X_test_t, y_test_t)
    
    return train_dataset, test_dataset, X_encoded.shape[1]

def client_update(client_model, optimizer, train_loader, epochs=3):
    """Trains the local client model for E epochs."""
    client_model.train()
    criterion = nn.BCELoss()
    for epoch in range(epochs):
        for data, target in train_loader:
            optimizer.zero_grad()
            output = client_model(data)
            loss = criterion(output, target)
            loss.backward()
            optimizer.step()
    return client_model.state_dict()

def server_aggregate(global_model, client_weights):
    """Averages the weights from all clients."""
    global_dict = global_model.state_dict()
    for k in global_dict.keys():
        global_dict[k] = torch.stack([client_weights[i][k].float() for i in range(len(client_weights))], 0).mean(0)
    global_model.load_state_dict(global_dict)
    return global_model

def evaluate_model(model, test_loader):
    model.eval()
    all_targets = []
    all_preds = []
    all_probs = []
    
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

def run_federated_learning():
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    partitioned_dir = os.path.join(base_dir, 'data', 'partitioned_banks')
    bank_files = glob.glob(os.path.join(partitioned_dir, 'bank_*.csv'))
    
    if not bank_files:
        print("No partitioned data found.")
        return
        
    print(f"Found {len(bank_files)} bank nodes.")
    
    clients_train_loaders = []
    clients_test_loaders = []
    input_dim = 0
    
    # 1. Load Data for each client
    for file in bank_files:
        train_ds, test_ds, idim = load_and_preprocess_bank_data(file)
        input_dim = idim
        clients_train_loaders.append(DataLoader(train_ds, batch_size=64, shuffle=True))
        clients_test_loaders.append(DataLoader(test_ds, batch_size=64, shuffle=False))
        
    # 2. Initialize Global Model
    global_model = FraudDNN(input_dim)
    
    num_rounds = 5
    epochs_per_round = 3
    
    print("\n--- Starting Federated Training (FedAvg) ---")
    for round_num in range(1, num_rounds + 1):
        print(f"\n[Round {round_num}]")
        client_weights = []
        
        # Simulated parallel training for each bank client
        for i in range(len(clients_train_loaders)):
            # Distribute global model to client
            client_model = FraudDNN(input_dim)
            client_model.load_state_dict(global_model.state_dict())
            
            # Local training
            optimizer = optim.Adam(client_model.parameters(), lr=0.001)
            weights = client_update(client_model, optimizer, clients_train_loaders[i], epochs=epochs_per_round)
            client_weights.append(copy.deepcopy(weights))
            print(f"  Bank {i+1} completed local training.")
            
        # Aggregate on Server
        global_model = server_aggregate(global_model, client_weights)
        
        # Evaluate global model on Bank 1's test set as a proxy for this demo
        acc, f1, auc = evaluate_model(global_model, clients_test_loaders[0])
        print(f"  Global Model Validation - Acc: {acc:.4f} | F1: {f1:.4f} | AUC: {auc:.4f}")
        
    print("\n✅ Federated Training Complete.")

if __name__ == "__main__":
    run_federated_learning()
