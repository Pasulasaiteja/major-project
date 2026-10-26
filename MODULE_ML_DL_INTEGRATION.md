# 🧠 Module: ML/DL Integration
## B.Tech Major Project — Individual Contribution & Viva Examination Guide
**System:** Federated Sentinel: Privacy-Preserving Federated Fraud Detection System  
**Module Name:** **ML/DL Integration** (Module 2 of 4)

---

## 👤 Team Member Profile & Viva Pitch
- **Assigned Team Member**: Student 2 (ML/DL & Federated Learning Lead)
- **Core Codebase Files**:
  - `FraudGNN` Architecture in `src/ml_pipeline/dp_federated_avg.py` (GraphSAGE layers, Edge MLP, Head)
  - `src/ml_pipeline/dp_federated_avg.py` (Opacus DP-SGD training loop, gradient clipping, Gaussian noise)
  - `src/ml_pipeline/mock_federated_avg.py` (Federated Averaging parameter aggregator across 5 rounds)
  - Exported Artifacts: `models/global_weights.pth` and `models/model_meta.json`
- **30-Second Elevator Pitch to Sir / External Examiner**:
  > *"Sir, I am responsible for the **ML/DL Integration** module of our project. I designed, trained, and optimized our deep learning architecture: `FraudGNN`, a specialized Graph Neural Network that uses GraphSAGE convolutional layers (`SAGEConv`) to pass messages across account nodes while projecting transaction edge attributes. To train this model across isolated bank silos without sharing raw data, I built our **Federated Learning pipeline using FedAvg**, coordinating 5 rounds of training across Nagaland Regional Bank, Meghalaya Regional Bank, and UP Gramin Bank. Furthermore, to prevent gradient inversion attacks, I integrated **Differential Privacy (DP-SGD)** using PyTorch Opacus, enforcing per-sample gradient clipping ($C=1.2$) and calibrated Gaussian noise ($\sigma=1.0$). Over 5 rounds, our global model converges to an F1-score of 0.6254 under a strict mathematical privacy guarantee of $\epsilon = 4.30, \delta = 10^{-5}$."*

---

## 1. Module Overview & Problem Statement

### 1.1 The Challenge of Training Financial AI Across Silos
1. **The Limitation of Traditional DNNs in Banking**:
   Standard Multi-Layer Perceptrons (MLPs) treat transactions as isolated data vectors. However, financial fraud involves relational patterns (e.g., mule accounts, smurfing, and coordinated merchant fraud). Our model must incorporate graph topology to capture transaction relationships.
2. **The Gradient Leakage Threat in Federated Learning**:
   Sharing model weights instead of raw data is a great first step, but it is **not sufficient on its own**. Attackers can use **Gradient Inversion Attacks** (Zhu et al.) or **Membership Inference Attacks** to mathematically reconstruct exact customer transaction amounts or balances from raw gradient updates.
3. **The Engineering Goal**:
   Integrate a deep Graph Neural Network with **Federated Averaging (FedAvg)** and **Differential Privacy (DP-SGD)** to provide mathematically guaranteed privacy bounds while detecting fraudulent transactions.

---

## 2. Technical Architecture: `FraudGNN` & Federated Optimization

```
+===================================================================================================+
|                                  `FraudGNN` NEURAL NETWORK TOPOLOGY                                |
+===================================================================================================+

   Node Features x_v in R^{B x 8}                  Edge Features e_uv in R^{B x 17}
   (Demographics, Balances)                       (Amount, Hour, Type, Merchant, Device)
             │                                                      │
             ▼                                                      ▼
     [GraphSAGE Conv 1]                                     [Edge Projection MLP]
   SAGEConv(8 -> 32, relu)                                Linear(17 -> 32, relu)
             │                                                      │
             ▼                                                      ▼
     [GraphSAGE Conv 2]                                    [Latent Edge Embedding]
  SAGEConv(32 -> 32, relu)                                       h_e in R^{B x 32}
             │                                                      │
             └──────────────────────────────┬───────────────────────┘
                                            ▼
                          [Concatenation & Fusion Layer]
                     Combined Embedding: [h_src || h_dst || h_e]
                               Dimension: 32 + 32 + 32 = 96
                                            │
                                            ▼
                             [Deep Classification Head]
                               Linear(96 -> 32) + ReLU
                               Linear(32 -> 1)
                               Sigmoid Activation: sigma(z) = 1 / (1 + e^-z)
                                            │
                                            ▼
                        Fraud Risk Probability: P(Fraud) in [0.0, 1.0]
```

### Federated DP-SGD Training Loop:

```
                  +---------------------------------------------+
                  |        CENTRAL COORDINATOR AGGREGATOR       |
                  |             (FedAvg Server Loop)            |
                  +---------------------------------------------+
                           ▲                           ▲
        DP-Noised Weights  │                           │  DP-Noised Weights
        w_t^{(1)}, eps_1   │                           │  w_t^{(3)}, eps_3
                           ▼                           ▼
            +--------------------------+   +--------------------------+
            |      BANK 1 (LOCAL)      |   |      BANK 3 (LOCAL)      |
            | - Init FraudGNN(w_t)     |   | - Init FraudGNN(w_t)     |
            | - Opacus PrivacyEngine:  |   | - Opacus PrivacyEngine:  |
            |   * Clip norm: C = 1.2   |   |   * Clip norm: C = 1.2   |
            |   * Gaussian: sigma = 1.0|   |   * Gaussian: sigma = 1.0|
            | - Train 3 local epochs   |   | - Train 3 local epochs   |
            | - Track RDP privacy spent|   | - Track RDP privacy spent|
            +--------------------------+   +--------------------------+
```

---

## 3. Mathematical Foundations

### 3.1 GraphSAGE Inductive Neighborhood Aggregation
For node $v \in \mathcal{V}$, let $\mathcal{N}(v)$ denote its local account neighbors. GraphSAGE aggregates neighborhood embeddings across layers $k \in \{1, 2\}$:

$$\mathbf{h}_{\mathcal{N}(v)}^{(k)} = \frac{1}{|\mathcal{N}(v)|} \sum_{u \in \mathcal{N}(v)} \mathbf{h}_u^{(k-1)}$$
$$\mathbf{h}_v^{(k)} = \text{ReLU}\left( \mathbf{W}^{(k)} \cdot \left[ \mathbf{h}_v^{(k-1)} \,\|\, \mathbf{h}_{\mathcal{N}(v)}^{(k)} \right] \right)$$

For transaction edge $(u, v)$ with attribute vector $\mathbf{e}_{uv}$:
$$\mathbf{z}_{uv} = \left[ \mathbf{h}_u^{(2)} \,\|\, \mathbf{h}_v^{(2)} \,\|\, \text{ReLU}(\mathbf{W}_e \mathbf{e}_{uv} + \mathbf{b}_e) \right]$$
$$P(\text{Fraud}) = \sigma(\mathbf{w}_h^T \mathbf{z}_{uv} + b)$$

---

### 3.2 Federated Averaging (FedAvg) Formulation
Given $K = 3$ regional bank nodes, where bank $k$ holds $n_k$ local samples and total samples $N = \sum_{k=1}^K n_k$.
The central objective is to optimize the global empirical risk:
$$\min_{\mathbf{w}} f(\mathbf{w}) = \sum_{k=1}^K \frac{n_k}{N} F_k(\mathbf{w})$$
where $F_k(\mathbf{w}) = -\frac{1}{n_k} \sum_{i=1}^{n_k} \left[ y_i \log(\hat{y}_i) + (1 - y_i)\log(1 - \hat{y}_i) \right]$ (Binary Cross-Entropy).

In round $t$:
1. Server broadcasts current global parameters $\mathbf{w}_t$.
2. Each client updates local weights for $E=3$ epochs via private gradients:
   $$\mathbf{w}_{t+1}^{(k)} \leftarrow \mathbf{w}_t - \eta \tilde{\mathbf{g}}_k$$
3. Server aggregates client updates via weighted parameter averaging:
   $$\mathbf{w}_{t+1} = \sum_{k=1}^K \frac{n_k}{N} \mathbf{w}_{t+1}^{(k)}$$

---

### 3.3 Differential Privacy (DP-SGD) with Opacus
A mechanism $\mathcal{M}$ guarantees $(\epsilon, \delta)$-Differential Privacy if for any two adjacent datasets $\mathcal{D}, \mathcal{D}'$ differing by at most one customer transaction:
$$\mathbb{P}[\mathcal{M}(\mathcal{D}) \in \mathcal{S}] \le e^\epsilon \cdot \mathbb{P}[\mathcal{M}(\mathcal{D}') \in \mathcal{S}] + \delta$$

**Per-Sample Gradient Clipping**:
Each per-sample gradient $\mathbf{g}_i = \nabla_{\mathbf{w}} \ell(f(\mathbf{x}_i; \mathbf{w}), y_i)$ is constrained to maximum $L_2$ threshold $C$:
$$\bar{\mathbf{g}}_i = \frac{\mathbf{g}_i}{\max\left(1, \frac{\|\mathbf{g}_i\|_2}{C}\right)}, \quad C = 1.2$$

**Gaussian Noise Perturbation**:
Calibrated zero-mean Gaussian noise is added to the batch gradient:
$$\tilde{\mathbf{g}} = \frac{1}{|\mathcal{B}|} \left( \sum_{i \in \mathcal{B}} \bar{\mathbf{g}}_i + \mathcal{N}\left(0, \sigma^2 C^2 \mathbf{I}\right) \right), \quad \sigma = 1.0$$

Privacy budget spent is accumulated using **Rényi Differential Privacy (RDP)** and evaluated at failure probability $\delta = 10^{-5}$.

---

## 4. Code Walkthrough & Implementation Details

### 4.1 PyTorch Geometric `FraudGNN` (`src/ml_pipeline/dp_federated_avg.py`)
```python
class FraudGNN(nn.Module):
    def __init__(self, node_dim=8, edge_dim=17, hidden_dim=32):
        super(FraudGNN, self).__init__()
        self.node_dim = node_dim
        self.edge_dim = edge_dim
        self.hidden_dim = hidden_dim
        
        # Message-passing layers using GraphSAGE from torch_geometric.nn
        self.conv1 = SAGEConv(self.node_dim, hidden_dim)
        self.conv2 = SAGEConv(hidden_dim, hidden_dim)
        
        # Edge feature transformation projection
        self.edge_mlp = nn.Linear(self.edge_dim, hidden_dim)
        
        # Classification head with Sigmoid activation
        self.head = nn.Sequential(
            nn.Linear(hidden_dim * 3, 32),
            nn.ReLU(),
            nn.Linear(32, 1),
            nn.Sigmoid()
        )
```
- **Forward Pass Flexibility**:
  - If `edge_index is None`: constructs an in-memory dynamic batch self-loop (`torch.arange(batch_size).repeat(2, 1)`). This allows seamless inference for single transactions in production and integration with SHAP.
  - If `edge_index` is provided: executes full neighborhood message-passing convolutions across connected account graphs.

### 4.2 DP-SGD Training Function with Opacus (`client_update_dp`)
```python
def client_update_dp(client_model, optimizer, train_loader, privacy_engine, epochs=3):
    client_model.train()
    criterion = nn.BCELoss()
    for epoch in range(epochs):
        for data, target in train_loader:
            optimizer.zero_grad()
            output = client_model(data)
            loss = criterion(output, target)
            loss.backward()
            optimizer.step()
            
    # Calculate privacy budget spent
    epsilon = privacy_engine.get_epsilon(delta=1e-5)
    return client_model.state_dict(), epsilon
```

### 4.3 Federated Aggregator (`server_aggregate`)
```python
def server_aggregate(global_model, client_weights):
    global_dict = global_model.state_dict()
    for k in global_dict.keys():
        # Averages the state dict tensors across all 3 client banks
        global_dict[k] = torch.stack(
            [client_weights[i][k].float() for i in range(len(client_weights))], 0
        ).mean(0)
    global_model.load_state_dict(global_dict)
    return global_model
```

---

## 5. Experimental Results: The Privacy-Utility Tradeoff

We conducted empirical benchmarks across 5 communication rounds comparing **FedAvg without DP** versus **FedAvg with Opacus DP-SGD**:

### Benchmark 1: Plain Federated Learning (FedAvg Without DP)
| Communication Round | Global Accuracy | Global Precision | Global Recall | Global F1-Score | Global AUC-ROC |
| :---: | :---: | :---: | :---: | :---: | :---: |
| Round 1 | 59.05% | 54.20% | 31.00% | 0.3943 | 0.7255 |
| Round 2 | 74.13% | 72.50% | 75.00% | 0.7371 | 0.8295 |
| Round 3 | 78.85% | 77.10% | 79.90% | 0.7847 | 0.8889 |
| Round 4 | 82.43% | 80.80% | 83.60% | 0.8217 | 0.9138 |
| **Round 5 (Final)** | **84.48%** | **82.35%** | **85.71%** | **0.8400** | **0.9272** |

### Benchmark 2: Differentially Private Federated Learning (FedAvg + Opacus DP-SGD)
| Communication Round | Global Accuracy | Global F1-Score | Global AUC-ROC | Privacy Budget ($\epsilon$) | Failure Probability ($\delta$) |
| :---: | :---: | :---: | :---: | :---: | :---: |
| Round 1 | 52.36% | 0.3924 | 0.5452 | $\epsilon = 0.86$ | $10^{-5}$ |
| Round 2 | 56.64% | 0.5753 | 0.5840 | $\epsilon = 1.72$ | $10^{-5}$ |
| Round 3 | 56.86% | 0.6557 | 0.5849 | $\epsilon = 2.58$ | $10^{-5}$ |
| Round 4 | 55.68% | 0.6671 | 0.5816 | $\epsilon = 3.44$ | $10^{-5}$ |
| **Round 5 (Final)** | **56.12%** | **0.6254** | **0.5829** | **$\epsilon = 4.30$** | **$10^{-5}$** |

### Defense of Results for Sir:
> *"Sir, when examining Benchmark 2, notice how the privacy budget $\epsilon$ accumulates by $0.86$ per round, reaching a final privacy budget of $\epsilon = 4.30$. Plain FedAvg achieves an impressive **84.48% accuracy and 0.9272 AUC-ROC**. With DP-SGD enabled, the Gaussian noise and gradient clipping cause an intentional utility tradeoff, yielding **56.12% accuracy and 0.6254 F1-Score**. This demonstrates the classic **Privacy-Utility Tradeoff curve** established by Abadi et al. (Google Brain, 2016) in deep learning literature."*

---

## 6. Live Demonstration Commands for Tomorrow

Execute the federated deep learning training pipeline in your terminal:

```bash
# Run the Differentially Private Federated Learning Pipeline
python src/ml_pipeline/dp_federated_avg.py
```

*Expected Terminal Log*:
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

## 7. Viva Voce Examination Preparation ("Sir's Questions & Answers")

#### Q1: "What is Federated Averaging (FedAvg) and why did you choose it?"
**Answer**:
> *"Sir, FedAvg (McMahan et al., 2017) is the foundational aggregation algorithm for federated learning. Instead of sending gradients on every mini-batch (which would require high network bandwidth), each client bank trains locally for multiple epochs ($E=3$). The central coordinator then averages the model weight state dictionaries: $\mathbf{w}_{t+1} = \sum \frac{n_k}{N} \mathbf{w}_t^{(k)}$. This drastically reduces network communication overhead while maintaining convergence."*

#### Q2: "What is Opacus and how does DP-SGD protect customer privacy?"
**Answer**:
> *"Sir, Opacus is a high-speed PyTorch library developed by Meta for training models with Differential Privacy. In standard gradient descent, one outlier transaction (e.g., an unusually large wire transfer) can dominate the weight updates. Opacus implements DP-SGD by:
> 1. Computing per-sample gradients and clipping their $L_2$ norm to $C = 1.2$, bounding sensitivity.
> 2. Adding calibrated Gaussian noise ($\sigma = 1.0$) to the summed gradients.
> This mathematically guarantees that no single customer's transaction can be reconstructed from the model weights."*

#### Q3: "What is the meaning of Epsilon ($\epsilon$) and Delta ($\delta$)?"
**Answer**:
> *"Sir, $\epsilon$ and $\delta$ define the mathematical privacy guarantee:
> - $\epsilon$ is the **privacy loss / budget**. Smaller $\epsilon$ means stronger privacy. Our system completes 5 rounds with a cumulative $\epsilon = 4.30$, which is well within standard academic literature benchmarks for deep learning ($\epsilon \le 10$).
> - $\delta$ is the **failure probability**. We set $\delta = 10^{-5}$, which satisfies the formal requirement that $\delta \ll 1/N$ (where total records $N \approx 60,000$)."*

#### Q4: "Why did you use GraphSAGE rather than standard GCN?"
**Answer**:
> *"Sir, standard Graph Convolutional Networks (GCN) are **transductive**—they require the entire graph Laplacian and all nodes to be present in memory during training. Banking systems are inherently **inductive**: new customer accounts and new transactions arrive continuously. GraphSAGE trains neighborhood aggregation functions, allowing our model to generate embeddings for unseen accounts and transactions at inference time without retraining the entire graph."*

#### Q5: "How are the trained model weights exported and used in production?"
**Answer**:
> *"Sir, upon completing Round 5, the global model state dictionary is serialized to `models/global_weights.pth` using `torch.save()`, and the architectural hyperparameters are exported to `models/model_meta.json`. Team Member 4's decentralized Edge APIs load these exact weights into memory on-premise at each bank node for live edge inference."*

---

## 8. Summary Checklist for Tomorrow
- [x] `FraudGNN` architecture (GraphSAGE + Edge MLP + Sigmoid) explained.
- [x] FedAvg mathematical formula ready.
- [x] DP-SGD parameters memorized ($C = 1.2$, $\sigma = 1.0$, $\delta = 10^{-5}$, $\epsilon = 4.30$).
- [x] Privacy-utility tradeoff table ready to present.
- [x] Output artifact paths (`models/global_weights.pth`) verified.
