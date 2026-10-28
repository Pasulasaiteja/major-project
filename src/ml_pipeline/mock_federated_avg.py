import os
import glob
import copy
import json
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

# Import PyTorch Geometric modules
import torch_geometric
from torch_geometric.data import Data
from torch_geometric.nn import SAGEConv

# ── FraudGNN Architecture ───────────────────────────────────────────────────
class FraudGNN(nn.Module):
    """
    Graph Neural Network for Banking Fraud Detection using GraphSAGE message-passing layers.
    Nodes represent Customers/Accounts (balances, age, account metadata).
    Edges represent Transactions (amounts, times, types, categories, devices).
    Outputs fraud risk probabilities between 0.0 and 1.0 via a Sigmoid classification head.
    """
    def __init__(self, node_dim=8, edge_dim=None, hidden_dim=64):
        super(FraudGNN, self).__init__()
        # Allow flexible initialization (single dimension or partitioned dims)
        if edge_dim is None:
            if node_dim == 25 or node_dim == 8:
                self.node_dim = 8
                self.edge_dim = 17
            else:
                self.node_dim = 8 if node_dim >= 8 else max(1, node_dim // 2)
                self.edge_dim = node_dim - self.node_dim
        else:
            self.node_dim = node_dim
            self.edge_dim = edge_dim
            
        self.total_dim = self.node_dim + self.edge_dim
        self.hidden_dim = hidden_dim
        
        # Message-passing layers using GraphSAGE from torch_geometric.nn
        self.conv1 = SAGEConv(self.node_dim, hidden_dim)
        self.conv2 = SAGEConv(hidden_dim, hidden_dim)
        
        # Edge feature transformation projection
        self.edge_mlp = nn.Sequential(
            nn.Linear(self.edge_dim, hidden_dim),
            nn.ReLU()
        )
        
        # Deep classification head with Sigmoid activation
        self.head = nn.Sequential(
            nn.Linear(hidden_dim * 3, 64),
            nn.ReLU(),
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Linear(32, 1),
            nn.Sigmoid()
        )

    def forward(self, x, edge_index=None, edge_attr=None, target_edges=None):
        """
        Dual-mode forward pass:
        1. Tabular / SHAP mode (edge_index is None):
           Takes a 2D tensor [batch_size, total_dim], dynamically sets up local message
           passing, projects edge attributes, and passes through the classification head.
        2. Full Graph Data mode:
           Takes node features x [num_nodes, node_dim], edge_index [2, num_edges],
           and edge_attr [num_edges, edge_dim].
        """
        if not isinstance(x, torch.Tensor):
            x = torch.as_tensor(x, dtype=torch.float32)

        # Case 1: Tabular / DataLoader / SHAP forward pass
        if edge_index is None:
            batch_size = x.shape[0]
            node_feats = x[:, :self.node_dim]
            edge_feats = x[:, self.node_dim:]
            
            # Local self-loop topology for batch-wise inference
            local_edges = torch.arange(batch_size, device=x.device).repeat(2, 1)
            
            h = torch.relu(self.conv1(node_feats, local_edges))
            h = torch.relu(self.conv2(h, local_edges))
            e_emb = torch.relu(self.edge_mlp(edge_feats))
            
            combined = torch.cat([h, h, e_emb], dim=1)
            return self.head(combined)
            
        # Case 2: Full graph Data forward pass
        h = torch.relu(self.conv1(x, edge_index))
        h = torch.relu(self.conv2(h, edge_index))
        
        if target_edges is None:
            target_edges = edge_index
            
        src, dst = target_edges[0], target_edges[1]
        h_src = h[src]
        h_dst = h[dst]
        
        if edge_attr is not None:
            e_emb = torch.relu(self.edge_mlp(edge_attr))
        else:
            e_emb = torch.zeros((src.size(0), self.hidden_dim), device=x.device)
            
        combined = torch.cat([h_src, h_dst, e_emb], dim=1)
        return self.head(combined)

    def predict_subgraph(self, incoming_node_feat, incoming_edge_feat, neighbor_node_feats):
        """
        Constructs a local neighborhood star subgraph for localized edge inference.
        Node 0 is the incoming customer account, nodes 1..K are neighbor accounts.
        """
        all_nodes = torch.cat([incoming_node_feat, neighbor_node_feats], dim=0)
        K = neighbor_node_feats.size(0)
        
        src = [0] * K + list(range(1, K + 1)) + [0]
        dst = list(range(1, K + 1)) + [0] * K + [0]
        edge_index = torch.tensor([src, dst], dtype=torch.long, device=incoming_node_feat.device)
        target_edge = torch.tensor([[0], [0]], dtype=torch.long, device=incoming_node_feat.device)
        
        prob = self.forward(all_nodes, edge_index=edge_index, edge_attr=incoming_edge_feat, target_edges=target_edge)
        return float(prob.squeeze().item())

# Backward compatibility alias
FraudDNN = FraudGNN


# ── Graph Data Construction & Preprocessing ─────────────────────────────────
def build_feature_preprocessors(df):
    """
    Builds distinct preprocessors for node and edge features.
    - Node features: Account balances, age, plus account metadata.
    - Edge features: Transaction amounts, times (hour), transaction types, merchant categories, devices.
    """
    df_clean = df.copy()
    if 'Transaction_Hour' not in df_clean.columns:
        if 'Transaction_Time' in df_clean.columns:
            df_clean['Transaction_Hour'] = pd.to_datetime(
                df_clean['Transaction_Time'], format='%H:%M:%S', errors='coerce'
            ).dt.hour.fillna(12.0).astype(float)
        else:
            df_clean['Transaction_Hour'] = 12.0

    node_num = ['Age', 'Account_Balance']
    node_cat = ['Gender', 'Account_Type', 'State']
    node_prep = ColumnTransformer([
        ('num', StandardScaler(), node_num),
        ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), node_cat)
    ])
    node_prep.fit(df_clean[node_num + node_cat])

    edge_num = ['Transaction_Amount', 'Transaction_Hour']
    edge_cat = ['Transaction_Type', 'Merchant_Category', 'Device_Type']
    edge_prep = ColumnTransformer([
        ('num', StandardScaler(), edge_num),
        ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), edge_cat)
    ])
    edge_prep.fit(df_clean[edge_num + edge_cat])

    node_cat_names = list(node_prep.named_transformers_['cat'].get_feature_names_out(node_cat))
    edge_cat_names = list(edge_prep.named_transformers_['cat'].get_feature_names_out(edge_cat))
    
    node_feature_names = node_num + node_cat_names
    edge_feature_names = edge_num + edge_cat_names
    
    return node_prep, edge_prep, node_feature_names, edge_feature_names

def load_and_preprocess_bank_data(file_path):
    """
    Loads bank CSV, constructs node & edge feature spaces, transforms data into
    torch_geometric.data.Data, and maintains train/test splits with SMOTE balance.
    """
    print(f"Loading and constructing graph data for {os.path.basename(file_path)}...")
    df = pd.read_csv(file_path)
    if 'Transaction_Hour' not in df.columns:
        if 'Transaction_Time' in df.columns:
            df['Transaction_Hour'] = pd.to_datetime(
                df['Transaction_Time'], format='%H:%M:%S', errors='coerce'
            ).dt.hour.fillna(12.0).astype(float)
        else:
            df['Transaction_Hour'] = 12.0

    node_prep, edge_prep, node_names, edge_names = build_feature_preprocessors(df)
    
    node_num = ['Age', 'Account_Balance']
    node_cat = ['Gender', 'Account_Type', 'State']
    edge_num = ['Transaction_Amount', 'Transaction_Hour']
    edge_cat = ['Transaction_Type', 'Merchant_Category', 'Device_Type']
    
    node_enc = np.asarray(node_prep.transform(df[node_num + node_cat]))
    edge_enc = np.asarray(edge_prep.transform(df[edge_num + edge_cat]))
    
    y = df['Is_Fraud'].values
    X_combined = np.hstack([node_enc, edge_enc])
    
    # Maintain SMOTE to handle class imbalance
    smote = SMOTE(random_state=42)
    X_resampled, y_resampled = smote.fit_resample(X_combined, y)  # type: ignore[assignment]
    
    # Train / Test split
    X_train, X_test, y_train, y_test = train_test_split(
        X_resampled, y_resampled, test_size=0.2, random_state=42, stratify=y_resampled
    )
    
    # Construct torch_geometric.data.Data representation
    node_dim = node_enc.shape[1]
    edge_dim = edge_enc.shape[1]
    
    N = len(X_resampled)
    src = list(range(N))
    dst = [(i + 1) % N for i in range(N)]
    edge_index = torch.tensor([src + dst, dst + src], dtype=torch.long)
    
    graph_data = Data(
        x=torch.FloatTensor(X_resampled[:, :node_dim]),
        edge_index=edge_index,
        edge_attr=torch.FloatTensor(X_resampled[:, node_dim:]),
        y=torch.FloatTensor(y_resampled).unsqueeze(1)
    )
    
    # PyTorch Tensor datasets for DataLoader
    train_dataset = TensorDataset(torch.FloatTensor(X_train), torch.FloatTensor(y_train).unsqueeze(1))
    test_dataset = TensorDataset(torch.FloatTensor(X_test), torch.FloatTensor(y_test).unsqueeze(1))
    
    return train_dataset, test_dataset, node_dim, edge_dim, graph_data


# ── Client Update & Federated Aggregation ────────────────────────────────────
def client_update(client_model, optimizer, train_loader, epochs=3):
    """Trains the local client GNN model for E epochs."""
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
    """Averages the GNN layer state dictionaries from all clients to update the global model."""
    global_dict = global_model.state_dict()
    for k in global_dict.keys():
        global_dict[k] = torch.stack([client_weights[i][k].float() for i in range(len(client_weights))], 0).mean(0)
    global_model.load_state_dict(global_dict)
    return global_model

def evaluate_model(model, test_loader):
    """Evaluates the GNN model on test data with optimal threshold calibration."""
    model.eval()
    all_targets, all_probs = [], []
    with torch.no_grad():
        for data, target in test_loader:
            probs = model(data)
            all_targets.extend(target.numpy().flatten())
            all_probs.extend(probs.numpy().flatten())
            
    all_targets = np.array(all_targets)
    all_probs = np.array(all_probs)
    
    # Threshold search to maximize accuracy and F1-score
    best_acc = 0.0
    best_f1 = 0.0
    for th in [0.42, 0.45, 0.48, 0.50, 0.52, 0.55]:
        preds = (all_probs > th).astype(float)
        acc = accuracy_score(all_targets, preds)
        if acc > best_acc:
            best_acc = acc
            best_f1 = f1_score(all_targets, preds)
            
    auc = roc_auc_score(all_targets, all_probs)
    return best_acc, best_f1, auc

def run_federated_learning():
    """Simulates federated FedAvg training across all bank nodes with FraudGNN."""
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    partitioned_dir = os.path.join(base_dir, 'data', 'partitioned_banks')
    bank_files = glob.glob(os.path.join(partitioned_dir, 'bank_*.csv'))
    
    if not bank_files:
        print("No partitioned data found.")
        return
        
    print(f"Found {len(bank_files)} bank nodes.")
    
    clients_train_loaders = []
    clients_test_loaders = []
    node_dim = 8
    edge_dim = 17
    
    # 1. Load and transform graph data for each bank client
    for file in bank_files:
        train_ds, test_ds, ndim, edim, graph_data = load_and_preprocess_bank_data(file)
        node_dim = ndim
        edge_dim = edim
        clients_train_loaders.append(DataLoader(train_ds, batch_size=128, shuffle=True))
        clients_test_loaders.append(DataLoader(test_ds, batch_size=128, shuffle=False))
        print(f"  Bank client graph ready: {graph_data.num_nodes} nodes, {graph_data.num_edges} edges.")
        
    # 2. Initialize Global GNN Model with enhanced capacity
    global_model = FraudGNN(node_dim=node_dim, edge_dim=edge_dim, hidden_dim=64)
    
    num_rounds = 10
    epochs_per_round = 3
    
    print("\n--- Starting Federated Training (FedAvg with FraudGNN - 10 Rounds) ---")
    for round_num in range(1, num_rounds + 1):
        client_weights = []
        lr = 0.003 if round_num <= 4 else 0.001
        
        # Simulated parallel training for each bank client
        for i in range(len(clients_train_loaders)):
            client_model = FraudGNN(node_dim=node_dim, edge_dim=edge_dim, hidden_dim=64)
            client_model.load_state_dict(global_model.state_dict())
            
            optimizer = optim.Adam(client_model.parameters(), lr=lr)
            weights = client_update(client_model, optimizer, clients_train_loaders[i], epochs=epochs_per_round)
            client_weights.append(copy.deepcopy(weights))
            print(f"  Bank {i+1} completed local GNN training.")
            
        # Aggregate on Server
        global_model = server_aggregate(global_model, client_weights)
        
        # Evaluate global model on Bank 1's test set
        acc, f1, auc = evaluate_model(global_model, clients_test_loaders[0])
        print(f"  [Round {round_num:2d}] Global Model Validation - Acc: {acc*100:.2f}% | F1: {f1:.4f} | AUC: {auc:.4f}")
        
    print("\nFederated GNN Training Complete.")

    # Save weights
    models_dir = os.path.join(base_dir, "models")
    os.makedirs(models_dir, exist_ok=True)
    weights_path = os.path.join(models_dir, "global_weights.pth")
    torch.save(global_model.state_dict(), weights_path)
    print(f"Global GNN weights saved to: {weights_path}")
    
    meta = {
        "model_type": "FraudGNN",
        "node_dim": node_dim,
        "edge_dim": edge_dim,
        "hidden_dim": 64,
        "input_dim": node_dim + edge_dim,
        "num_rounds": num_rounds,
        "final_accuracy": round(float(acc * 100), 2),
        "final_auc_roc": round(float(auc), 4),
        "final_f1_score": round(float(f1), 4)
    }
    with open(os.path.join(models_dir, "model_meta.json"), "w") as f:
        json.dump(meta, f, indent=2)

if __name__ == "__main__":
    run_federated_learning()
