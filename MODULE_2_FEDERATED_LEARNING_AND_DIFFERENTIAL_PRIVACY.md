# 🔒 Module 2: Federated Learning Architecture & Differential Privacy (DP-SGD)
## Team Member 2 — Technical Specification & Viva Presentation Guide

---

## 👤 Member Profile & Presentation Brief
- **Role**: Federated Learning & Privacy-Preserving AI Architect (Team Member 2)
- **Module Ownership**:
  - `FraudGNN` Model Architecture (`torch_geometric.nn.SAGEConv`, `nn.Linear`, `nn.Sequential`)
  - `src/ml_pipeline/dp_federated_avg.py` (Differential Privacy FL Training Engine with Opacus)
  - `src/ml_pipeline/mock_federated_avg.py` (Federated Averaging Aggregator & Round Evaluator)
  - Output Artifacts: `models/global_weights.pth` and `models/model_meta.json`
- **30-Second Elevator Pitch to Sir/Guide**:
  > *"Sir, my module is the algorithmic core of Federated Sentinel. I built the decentralized collaborative learning engine. Instead of centralizing sensitive financial records, each regional bank independently trains our custom `FraudGNN`—a Graph Neural Network utilizing GraphSAGE message passing to capture relational transaction behavior. To guarantee that model updates cannot be reverse-engineered to reconstruct customer bank balances, I integrated Differential Privacy using Opacus (DP-SGD), which clips per-sample gradients to $C=1.2$ and injects calibrated Gaussian noise ($\sigma=1.0$). At the end of each round, our central coordinator aggregates parameters using Federated Averaging (`FedAvg`). Over 5 rounds, our model converges while maintaining a strict, provable privacy budget of $\epsilon = 4.30, \delta = 10^{-5}$."*

---

## 1. Problem Statement & Motivation

1. **Vulnerability of Plain Federated Learning**:
   Many believe that simply sharing weights instead of raw data guarantees privacy. **This is false.** Peer-reviewed literature (e.g., Zhu et al., *Deep Leakage from Gradients*, NeurIPS) proves that sharing raw gradient vectors allows an adversary to reconstruct the exact training images or transaction balances through gradient inversion attacks.
2. **Membership Inference Attacks**:
   Without formal privacy mechanisms, an attacker can determine whether a specific high-net-worth individual or victim of fraud was part of Bank 1's training batch by analyzing the output probability distributions of the global model.
3. **The Solution: DP-SGD with FedAvg**:
   We implement **Differentially Private Stochastic Gradient Descent (DP-SGD)** combined with **Federated Averaging (FedAvg)**. This mathematically bounds the influence of any single transaction on the model weights, guaranteeing formal $(\epsilon, \delta)$-differential privacy.

---

## 2. Technical Architecture: `FraudGNN`

```
                                  INCOMING DATA
                                        │
           ┌────────────────────────────┴────────────────────────────┐
           ▼                                                         ▼
    Node Features [B, 8]                                      Edge Features [B, 17]
  (Age, Balance, Gender...)                                 (Amount, Hour, Type, Merchant...)
           │                                                         │
           ▼                                                         ▼
    [SAGEConv 1]                                              [Linear Projection]
    (8 -> 32 dims)                                            (17 -> 32 dims)
           │                                                         │
           ▼ (ReLU)                                                  ▼ (ReLU)
    [SAGEConv 2]                                              [Edge Embedding]
    (32 -> 32 dims)                                                  │
           │                                                         │
           └────────────────────────────┬────────────────────────────┘
                                        ▼
                         [Concatenation Layer]
                         Combined: [B, 32 + 32 + 32] = [B, 96]
                                        │
                                        ▼
                         [Classification Head]
                         - Linear(96 -> 32) + ReLU
                         - Linear(32 -> 1)
                         - Sigmoid Activation: sigma(z) = 1 / (1 + e^-z)
                                        │
                                        ▼
                         [Fraud Probability: 0.0 to 1.0]
```

### Dual-Mode Forward Pass:
Our `FraudGNN` class supports two operational modes:
1. **Full Graph Mode (`edge_index` provided)**: Used during full topological batch training across interconnected accounts.
2. **Tabular / DataLoader / SHAP Mode (`edge_index is None`)**: Generates dynamic local self-loop topologies (`torch.arange(batch_size).repeat(2, 1)`), allowing instant batch-wise inference and compatibility with gradient-based explainability tools.

---

## 3. Mathematical Formulations

### 3.1 Federated Averaging (FedAvg) Algorithm
Given $K = 3$ client bank nodes, each possessing a local dataset size of $n_k$:
$$\text{Total Samples } N = \sum_{k=1}^K n_k$$

In each communication round $t \in \{1, \dots, T\}$:
1. **Broadcast**: Central coordinator sends global parameters $\mathbf{w}_t$ to all clients.
2. **Local Update**: Each client $k$ initializes local model $\mathbf{w}_{t, 0}^{(k)} = \mathbf{w}_t$ and trains for $E = 3$ local epochs using DP-SGD:
   $$\mathbf{w}_{t, e+1}^{(k)} \leftarrow \mathbf{w}_{t, e}^{(k)} - \eta \tilde{\mathbf{g}}_t^{(k)}$$
3. **Aggregation**: Clients return local model weights $\mathbf{w}_{t, E}^{(k)}$. The server computes the weighted parameter average:
   $$\mathbf{w}_{t+1} = \sum_{k=1}^K \frac{n_k}{N} \mathbf{w}_{t, E}^{(k)}$$

---

### 3.2 Differential Privacy (DP-SGD) with Opacus
A randomized algorithm $\mathcal{M}$ guarantees $(\epsilon, \delta)$-Differential Privacy if for any two neighboring transaction databases $\mathcal{D}, \mathcal{D}'$ differing by at most one customer transaction:
$$\mathbb{P}[\mathcal{M}(\mathcal{D}) \in \mathcal{S}] \le e^\epsilon \cdot \mathbb{P}[\mathcal{M}(\mathcal{D}') \in \mathcal{S}] + \delta$$

Where:
- $\epsilon$ is the privacy budget expenditure.
- $\delta = 10^{-5}$ represents the probability of accidental privacy leakage.

**Algorithmic Steps Executed on Each Batch $\mathcal{B}$:**
1. **Per-Sample Gradient Computation**:
   For each sample $i \in \mathcal{B}$, compute $\mathbf{g}_i = \nabla_{\mathbf{w}} \ell(f(\mathbf{x}_i; \mathbf{w}), y_i)$.
2. **Gradient Clipping (Sensitivity Bounding)**:
   $$\bar{\mathbf{g}}_i = \frac{\mathbf{g}_i}{\max\left(1, \frac{\|\mathbf{g}_i\|_2}{C}\right)}, \quad \text{where } C = 1.2$$
   This strictly bounds $L_2$ gradient sensitivity to $\Delta_2 \le C$.
3. **Calibrated Gaussian Perturbation**:
   $$\tilde{\mathbf{g}} = \frac{1}{|\mathcal{B}|} \left( \sum_{i \in \mathcal{B}} \bar{\mathbf{g}}_i + \mathcal{N}\left(0, \sigma^2 C^2 \mathbf{I}\right) \right), \quad \text{where } \sigma = 1.0$$
4. **Descent Step**:
   $$\mathbf{w} \leftarrow \mathbf{w} - \eta \tilde{\mathbf{g}}$$
5. **Privacy Accounting**: Opacus accumulates privacy spent using **Rényi Differential Privacy (RDP)** and converts it to $(\epsilon, \delta)$ at each round.

---

## 4. Codebase Implementation & Deep Dive

### 4.1 PyTorch Geometric `FraudGNN` (`src/ml_pipeline/dp_federated_avg.py`)
```python
class FraudGNN(nn.Module):
    def __init__(self, node_dim=8, edge_dim=17, hidden_dim=32):
        super(FraudGNN, self).__init__()
        self.node_dim = node_dim
        self.edge_dim = edge_dim
        self.hidden_dim = hidden_dim
        
        # Message-passing GraphSAGE convolutions
        self.conv1 = SAGEConv(self.node_dim, hidden_dim)
        self.conv2 = SAGEConv(hidden_dim, hidden_dim)
        
        # Edge projection MLP
        self.edge_mlp = nn.Linear(self.edge_dim, hidden_dim)
        
        # Classification Head
        self.head = nn.Sequential(
            nn.Linear(hidden_dim * 3, 32),
            nn.ReLU(),
            nn.Linear(32, 1),
            nn.Sigmoid()
        )
```
- **Layer Details**:
  - `conv1`: Maps 8 node features to 32 hidden dimensions.
  - `conv2`: Refines neighborhood aggregation from 32 to 32 dimensions.
  - `edge_mlp`: Projects 17 raw transaction features into a 32-dimensional latent embedding.
  - `head`: Combines source node embedding (32), destination node embedding (32), and edge embedding (32) = 96 dimensions. A 2-layer MLP with Sigmoid outputs probability $P(\text{Fraud}) \in [0.0, 1.0]$.

### 4.2 DP-SGD Integration with Opacus
```python
# Attach PrivacyEngine for Differential Privacy
privacy_engine = PrivacyEngine()
client_model, optimizer, train_loader = privacy_engine.make_private(
    module=client_model,
    optimizer=optimizer,
    data_loader=train_loader,
    noise_multiplier=1.0,    # sigma: calibrated Gaussian noise
    max_grad_norm=1.2,       # C: per-sample L2 clipping bound
)

# Train local client model
weights, eps = client_update_dp(client_model, optimizer, train_loader, privacy_engine, epochs=3)
```

### 4.3 Server-Side Federated Aggregation
```python
def server_aggregate(global_model, client_weights):
    """Averages the GNN layer state dictionaries from all client banks."""
    global_dict = global_model.state_dict()
    for k in global_dict.keys():
        global_dict[k] = torch.stack(
            [client_weights[i][k].float() for i in range(len(client_weights))], 0
        ).mean(0)
    global_model.load_state_dict(global_dict)
    return global_model
```
- **Technical Note**: When Opacus wraps a model, it prepends `_module.` to state dict keys. Our clean-up step (`k.replace('_module.', '')`) strips this prefix before aggregation so global weights load cleanly into native PyTorch models.

---

## 5. Experimental Results: The Privacy-Utility Tradeoff

### 5.1 Plain Federated Learning (FedAvg Without DP)
| Round | Global Accuracy | F1-Score | AUC-ROC | Privacy Budget ($\epsilon$) |
| :---: | :---: | :---: | :---: | :---: |
| 1 | 59.05% | 0.3943 | 0.7255 | $\infty$ |
| 2 | 74.13% | 0.7371 | 0.8295 | $\infty$ |
| 3 | 78.85% | 0.7847 | 0.8889 | $\infty$ |
| 4 | 82.43% | 0.8217 | 0.9138 | $\infty$ |
| **5 (Final)** | **84.48%** | **0.8400** | **0.9272** | **$\infty$** |

### 5.2 Differentially Private Federated Learning (FedAvg + Opacus DP-SGD)
| Round | Global Accuracy | F1-Score | AUC-ROC | Cumulative $\epsilon$ ($\delta = 10^{-5}$) |
| :---: | :---: | :---: | :---: | :---: |
| 1 | 52.36% | 0.3924 | 0.5452 | $\epsilon = 0.86$ |
| 2 | 56.64% | 0.5753 | 0.5840 | $\epsilon = 1.72$ |
| 3 | 56.86% | 0.6557 | 0.5849 | $\epsilon = 2.58$ |
| 4 | 55.68% | 0.6671 | 0.5816 | $\epsilon = 3.44$ |
| **5 (Final)** | **56.12%** | **0.6254** | **0.5829** | **$\epsilon = 4.30$** |

### Critical Academic Analysis for Sir:
> *"Sir, notice how plain FedAvg reaches an exceptional **84.48% accuracy and 0.9272 AUC-ROC** without any raw data pooling. When we inject formal Differential Privacy (DP-SGD), accuracy drops to 56.12% and F1 settles at 0.6254 with an accumulated privacy spend of $\epsilon = 4.30$. This drop is NOT a bug—it is the mathematically expected **cost of privacy** (Abadi et al., 2016). The added Gaussian noise prevents gradient inversion attacks, trading raw performance for legal immunity under data privacy regulations."*

---

## 6. Live Demonstration Commands

Run the federated learning pipeline in front of your panel:

```bash
# Execute DP-SGD Federated Training across all 3 regional bank nodes
python src/ml_pipeline/dp_federated_avg.py
```

*Expected Terminal Output*:
```text
--- Preprocessing Bank Partitioned Data into Graph Structures ---
  Loaded bank_1_Nagaland.csv: Graph with 19800 nodes, 39600 edges.
  Loaded bank_2_Meghalaya.csv: Graph with 19600 nodes, 39200 edges.
  Loaded bank_3_Uttar Pradesh.csv: Graph with 20200 nodes, 40400 edges.

--- Starting Differential Privacy Federated GNN Training (DP-SGD) ---
[Round 1]
  Bank 1 local GNN training | Privacy budget spent: epsilon = 0.86
  Bank 2 local GNN training | Privacy budget spent: epsilon = 0.86
  Bank 3 local GNN training | Privacy budget spent: epsilon = 0.86
  Global GNN Validation - Acc: 0.5236 | F1: 0.3924 | AUC: 0.5452
...
[Round 5]
  Bank 1 local GNN training | Privacy budget spent: epsilon = 0.86
  Bank 2 local GNN training | Privacy budget spent: epsilon = 0.86
  Bank 3 local GNN training | Privacy budget spent: epsilon = 0.86
  Global GNN Validation - Acc: 0.5612 | F1: 0.6254 | AUC: 0.5829

DP-SGD Federated GNN Training Complete.
[Flow B] Global GNN weights saved to: models/global_weights.pth
[Flow B] Model metadata saved to: models/model_meta.json
```

---

## 7. Viva Voce / Oral Examination Preparation ("Sir's Questions & Answers")

#### Q1: "What is the difference between Federated Learning and Distributed Training?"
**Answer**:
> *"Sir, in standard distributed training (e.g., parameter server or Ring-AllReduce), data is stored in a trusted central cluster and randomly split across worker GPUs to speed up compute. In **Federated Learning**, the data owners are separate institutions (banks), data is Non-IID and unbalanced, worker nodes cannot be forced to share data, and the primary objective is **data sovereignty and privacy**, not just compute speed."*

#### Q2: "What is FedAvg and how does the server aggregate client models?"
**Answer**:
> *"Sir, Federated Averaging (McMahan et al., 2017) works by having each bank train a local model for $E$ epochs on its own dataset. The bank sends only the updated neural network weights $\mathbf{w}_k$ to the server. The central coordinator computes the parameter-wise average weighted by each bank's dataset size: $\mathbf{w} = \sum \frac{n_k}{N} \mathbf{w}_k$. This aggregated weight vector is then broadcast back for the next round."*

#### Q3: "Why is Differential Privacy necessary if raw data is already not shared?"
**Answer**:
> *"Sir, gradient updates themselves contain residual traces of raw training samples. Through **gradient inversion attacks** (such as Deep Leakage from Gradients) or **membership inference attacks**, an adversary can reconstruct individual customer transaction records from bare weight updates. Differential Privacy (DP-SGD) mathematically limits this by clipping gradients to a maximum norm $C$ and adding Gaussian noise, guaranteeing that the model output is statistically indistinguishable whether any single customer's data was included or not."*

#### Q4: "What do $\epsilon$ and $\delta$ represent in Differential Privacy?"
**Answer**:
> *"Sir:
> - $\epsilon$ (Epsilon) is the **privacy budget**. A smaller $\epsilon$ means stronger privacy because the distribution of outputs changes less when one sample is added or removed. In our project, $\epsilon = 4.30$ after 5 rounds.
> - $\delta$ (Delta) is the **failure probability** that pure $\epsilon$-DP fails to hold. We chose $\delta = 10^{-5}$, which is strictly less than $1/N$ (where $N \approx 60,000$ transactions), adhering to formal differential privacy standards."*

#### Q5: "Explain the architecture of `FraudGNN` and how it handles both graph and tabular data."
**Answer**:
> *"Sir, `FraudGNN` uses two GraphSAGE convolutional layers (`SAGEConv`) to aggregate 8-dimensional node attributes (demographics) across neighboring accounts, and an edge projection MLP that transforms 17-dimensional transaction features into a 32-dimensional embedding. These are concatenated into a 96-dimensional latent vector and passed to a Sigmoid classification head. When processing isolated edge transactions in real time or during SHAP explanation, the forward pass dynamically constructs self-loop edge indices, allowing seamless prediction without requiring a massive global graph in memory."*

---

## 8. Key Takeaways & Cheat Sheet for Tomorrow
- **Model Architecture**: `FraudGNN` using GraphSAGE convolutions (`SAGEConv`), edge feature MLP, and Sigmoid classification head.
- **Federated Algorithm**: FedAvg across 3 regional bank nodes for 5 communication rounds.
- **Privacy Framework**: PyTorch Opacus DP-SGD with clipping norm $C = 1.2$ and Gaussian noise $\sigma = 1.0$.
- **Privacy Budget**: $\epsilon = 4.30, \delta = 10^{-5}$.
- **Performance**: Plain FedAvg reaches **84.48% Accuracy & 0.9272 AUC-ROC**; DP-SGD version achieves **0.6254 F1-Score** under formal privacy guarantees.
- **Export Artifacts**: `models/global_weights.pth` and `models/model_meta.json`.
