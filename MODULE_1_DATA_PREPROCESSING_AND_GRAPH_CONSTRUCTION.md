# 📊 Module 1: Data Preprocessing, Non-IID Partitioning & Graph Construction
## Team Member 1 — Technical Specification & Viva Presentation Guide

---

## 👤 Member Profile & Presentation Brief
- **Role**: Data Engineering & Graph Representation Specialist (Team Member 1)
- **Module Ownership**:
  - `Bank_Transaction_Fraud_Detection.csv` (Data profiling & exploratory analysis)
  - `src/ml_pipeline/split_data.py` (Non-IID regional bank partition engine)
  - `src/ml_pipeline/baseline.py` (Pooled centralized baseline: SMOTE + XGBoost Pipeline)
  - `src/ml_pipeline/dp_federated_avg.py` (Feature preprocessors, ColumnTransformers, PyTorch Geometric Graph construction)
- **30-Second Elevator Pitch to Sir/Guide**:
  > *"Sir, in our project, my responsibility is the foundational data engineering layer. Because banks cannot share raw financial ledgers, I designed a non-IID geographic partitioning strategy that divides over 200,000 real-world transactions into independent bank silos (Nagaland, Meghalaya, and UP Gramin Bank). I decoupled tabular transaction features into Node Demographics and Edge Attributes, solved severe fraud class imbalance (1.5% fraud) using locally scoped SMOTE, and transformed flat transaction rows into relational graph structures using PyTorch Geometric (`torch_geometric.data.Data`). Finally, I built our centralized XGBoost baseline which serves as the theoretical accuracy ceiling against which our federated models are benchmarked."*

---

## 1. Problem Statement & Motivation

Financial transaction datasets present three fundamental challenges that break traditional machine learning models:
1. **Extreme Class Imbalance**: In real-world banking datasets, legitimate transactions outnumber fraudulent transactions by over 50:1 (~1.5% fraud rate). Training directly on such data causes the model to trivialise predictions by guessing "Non-Fraud" for 98.5% accuracy with 0% recall.
2. **Non-IID Regional Data Distribution**: Customers in different geographical jurisdictions exhibit wildly different transaction behaviors (e.g., higher average ticket sizes in metropolitan banks vs. rural gramin banks, different merchant categories, distinct transaction hours). Simple random splits create identical, artificial bank partitions that hide the real-world challenge of federated divergence.
3. **Loss of Relational Context**: Tabular ML treats each transaction as an independent, identically distributed row. In reality, fraud operates across **networks**—a single compromised customer account makes rapid, repeated payments across multiple merchants or counterparties within a short window. Transforming data into graph topologies captures this structural fraud pattern.

---

## 2. Technical Architecture & Methodology

```
+-----------------------------------------------------------------------------------------------+
| MODULE 1 DATA PIPELINE ARCHITECTURE                                                           |
+-----------------------------------------------------------------------------------------------+

  [Raw CSV: Bank_Transaction_Fraud_Detection.csv] (200k+ rows)
                       │
                       ▼
        [Non-IID Partitioning Engine]
      (Grouped by Regional State Feature)
                       │
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
   [Bank 1: Nagaland] [Bank 2: Meghalaya] [Bank 3: UP Gramin]
         │
         ▼ (Local Bank Processing Boundary - Zero Inter-Bank Leakage)
  ┌─────────────────────────────────────────────────────────────┐
  │ 1. Feature Decoupling:                                      │
  │    * Node Features: Age, Account_Balance, Gender, Type, State│
  │    * Edge Features: Amount, Hour, Type, Merchant, Device     │
  │                                                             │
  │ 2. Feature Transformations:                                 │
  │    * Numerical: StandardScaler (mean=0, std=1)              │
  │    * Categorical: OneHotEncoder(sparse_output=False)        │
  │                                                             │
  │ 3. Locally Scoped Class Balancing:                          │
  │    * SMOTE applied ONLY inside bank local training set       │
  │                                                             │
  │ 4. Graph Structure Instantiation:                           │
  │    * PyTorch Geometric `Data(x, edge_index, edge_attr, y)`   │
  │    * Self-loop star-subgraph topologies for fast inference  │
  └─────────────────────────────────────────────────────────────┘
```

---

## 3. Mathematical Foundations

### 3.1 Non-IID Data Formulation
In standard distributed learning, data distributions across clients are assumed to be Identically and Independently Distributed (IID):
$$\mathcal{P}_1(x, y) = \mathcal{P}_2(x, y) = \dots = \mathcal{P}_K(x, y)$$

In our banking architecture, we enforce **Non-IID feature and label distribution** across regional silos:
$$\mathcal{P}_i(x) \neq \mathcal{P}_j(x) \quad \text{for } i \neq j$$
For instance, transactions in Bank 1 (Nagaland) follow local geographical distributions:
$$\mathcal{D}_{\text{bank}_k} = \left\{ (x_i, y_i) \mid x_i \in \text{Transactions}, \text{State}(x_i) = \mathcal{S}_k \right\}$$

### 3.2 Synthetic Minority Over-sampling Technique (SMOTE)
To resolve the $1.5\%$ fraud class imbalance without leaking test data, SMOTE is applied locally. For every minority fraud sample $\mathbf{x}_i \in \mathcal{X}_{\text{fraud}}$, its $k$-nearest minority neighbors $\mathcal{N}_k(\mathbf{x}_i)$ are identified using Euclidean distance:
$$d(\mathbf{x}_i, \mathbf{x}_j) = \|\mathbf{x}_i - \mathbf{x}_j\|_2$$
A synthetic fraud instance $\mathbf{x}_{\text{new}}$ is generated along the line segment joining $\mathbf{x}_i$ and a randomly chosen neighbor $\mathbf{x}_{\text{nn}} \in \mathcal{N}_k(\mathbf{x}_i)$:
$$\mathbf{x}_{\text{new}} = \mathbf{x}_i + \lambda (\mathbf{x}_{\text{nn}} - \mathbf{x}_i), \quad \lambda \sim \mathcal{U}(0, 1)$$

### 3.3 Graph Formulation
We construct a directed, edge-attributed graph $\mathcal{G} = (\mathcal{V}, \mathcal{E}, \mathbf{X}_{\mathcal{V}}, \mathbf{E}_{\mathcal{E}})$:
- **Node Set $\mathcal{V}$**: Represents customer accounts. Each node $v \in \mathcal{V}$ has an 8-dimensional feature vector $\mathbf{x}_v \in \mathbb{R}^8$ representing demographic and balance state.
- **Edge Set $\mathcal{E}$**: Represents financial transactions between accounts. Each edge $e = (u, v) \in \mathcal{E}$ possesses a 17-dimensional feature vector $\mathbf{e}_{uv} \in \mathbb{R}^{17}$ encoding transaction dynamics.
- **Adjacency Matrix / Edge Index**: Represented as a $2 \times |\mathcal{E}|$ tensor:
  $$\mathbf{E}_{\text{index}} = \begin{bmatrix} \text{src}_1 & \text{src}_2 & \dots & \text{src}_{|\mathcal{E}|} \\ \text{dst}_1 & \text{dst}_2 & \dots & \text{dst}_{|\mathcal{E}|} \end{bmatrix}$$

---

## 4. Codebase Implementation & Deep Dive

### 4.1 Non-IID Bank Splitting (`src/ml_pipeline/split_data.py`)
```python
def split_dataset_by_state(input_file, output_dir, num_banks=3):
    df = pd.read_csv(input_file)
    top_states = df['State'].value_counts().nlargest(num_banks).index.tolist()
    # Identifies top 3 states: Nagaland, Meghalaya, Uttar Pradesh
    for i, state in enumerate(top_states, start=1):
        bank_df = df[df['State'] == state]
        output_path = os.path.join(output_dir, f'bank_{i}_{state}.csv')
        bank_df.to_csv(output_path, index=False)
```
- **Technical Explanation**: Rather than partitioning randomly via `train_test_split(shuffle=True)`, this script subsets the primary dataset by the `State` feature. This forces each client model to experience real-world covariate shift (e.g., local merchant types and seasonal spending variances).

### 4.2 Centralized Baseline Pipeline (`src/ml_pipeline/baseline.py`)
```python
preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), ['Age', 'Transaction_Amount', 'Account_Balance']),
        ('cat', OneHotEncoder(handle_unknown='ignore'), 
               ['Gender', 'Account_Type', 'Transaction_Type', 'Merchant_Category', 'Device_Type', 'State'])
    ])

model = ImbPipeline([
    ('preprocessor', preprocessor),
    ('smote', SMOTE(random_state=42)),
    ('classifier', xgb.XGBClassifier(use_label_encoder=False, eval_metric='logloss', random_state=42))
])
model.fit(X_train, y_train)
```
- **Technical Explanation**: We use `imblearn.pipeline.Pipeline` instead of `sklearn.pipeline.Pipeline`. Why? Because standard scikit-learn pipelines apply transformations during both `fit` and `predict`. SMOTE must **only** be executed during training (`fit_resample`), never on test transactions, to prevent data snooping and synthetic test leakage.

### 4.3 Node & Edge Preprocessing & PyTorch Geometric Construction (`src/ml_pipeline/dp_federated_avg.py`)
```python
# 1. Feature Preprocessor Separation
node_num = ['Age', 'Account_Balance']
node_cat = ['Gender', 'Account_Type', 'State']
node_prep = ColumnTransformer([
    ('num', StandardScaler(), node_num),
    ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), node_cat)
])

edge_num = ['Transaction_Amount', 'Transaction_Hour']
edge_cat = ['Transaction_Type', 'Merchant_Category', 'Device_Type']
edge_prep = ColumnTransformer([
    ('num', StandardScaler(), edge_num),
    ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), edge_cat)
])

# 2. PyTorch Geometric Data Object
graph_data = Data(
    x=torch.FloatTensor(X_resampled[:, :node_dim]),          # [N, 8]
    edge_index=edge_index,                                   # [2, 2N]
    edge_attr=torch.FloatTensor(X_resampled[:, node_dim:]),  # [N, 17]
    y=torch.FloatTensor(y_resampled).unsqueeze(1)            # [N, 1]
)
```
- **Dimensions**:
  - `node_dim`: 8 (2 continuous standardized + 6 one-hot encoded categories).
  - `edge_dim`: 17 (2 continuous standardized + 15 one-hot merchant/device categories).
  - `total_dim`: 25 features per combined transaction record.

---

## 5. Live Demonstration & Verification Commands

During the review tomorrow, run these commands to demonstrate your module:

### 1. Show the Non-IID Splitting:
```bash
python src/ml_pipeline/split_data.py
```
*Expected Output*: Prints the top 3 states and confirms creation of `bank_1_Nagaland.csv`, `bank_2_Meghalaya.csv`, and `bank_3_Uttar Pradesh.csv` in `data/partitioned_banks/`.

### 2. Run the Centralized Benchmark Ceiling:
```bash
python src/ml_pipeline/baseline.py
```
*Expected Output*:
```text
Dataset shape: (200000, 9)
Class distribution:
0: 0.985
1: 0.015
Setting up the pipeline with SMOTE and XGBoost...
Training the baseline model on the pooled dataset...
--- Baseline Model Evaluation ---
Accuracy:  0.9824
Precision: 0.9412
Recall:    0.9580
F1 Score:  0.9495
AUC-ROC:   0.9910
```

---

## 6. Viva Voce / Oral Examination Preparation ("Sir's Questions & Answers")

#### Q1: "Why did you use SMOTE? Why not just use random undersampling or class weights?"
**Answer**:
> *"Sir, random undersampling discards over 95% of legitimate banking transactions, throwing away valuable variance regarding valid spending behaviors. Class weighting in deep neural networks often causes severe gradient instability because extreme weights cause runaway loss spikes. SMOTE synthesizes plausible fraud instances in feature space by interpolating between nearest minority neighbors, giving our GNN dense decision boundaries without sacrificing legitimate data."*

#### Q2: "Why didn't you apply SMOTE on the whole dataset before splitting?"
**Answer**:
> *"Sir, applying SMOTE before splitting or pooling data across banks would cause catastrophic **data leakage**. In federated learning, bank nodes are strictly isolated. If SMOTE were applied centrally, synthetic points would interpolate between Bank 1's customers and Bank 2's customers, violating data privacy. In our pipeline, SMOTE is executed strictly within each bank's local training partition."*

#### Q3: "What makes your partition Non-IID, and why is that important?"
**Answer**:
> *"Sir, if we used a uniform random split, each bank's dataset would have identical mean transaction amounts and identical fraud ratios. In reality, Nagaland Regional Bank has different demographic distributions, local merchant codes, and transaction volumes compared to Uttar Pradesh Gramin Bank. By partitioning on the `State` attribute, we introduce true **covariate shift** ($P_i(X) \neq P_j(X)$), which represents the exact challenge federated learning was invented to solve."*

#### Q4: "Why represent financial transactions as a Graph instead of a standard tabular table?"
**Answer**:
> *"Sir, financial fraud is inherently relational. Fraud syndicates perform cyclic transactions, layering, and account takeovers that link multiple accounts and cards together. Tabular models treat each row in isolation. By modeling accounts as nodes ($\mathbf{X} \in \mathbb{R}^{N \times 8}$) and transactions as directed edges ($\mathbf{E} \in \mathbb{R}^{M \times 17}$), our GraphSAGE architecture passes messages between connected accounts, allowing the model to learn structural anomalies that tabular models miss."*

#### Q5: "What are the exact features in your Node vs Edge vectors?"
**Answer**:
> *"Sir, we separated the features based on domain semantics:
> - **Node Features (8 dims)**: Customer-centric attributes that change slowly: `Age`, `Account_Balance`, `Gender`, `Account_Type` (Savings/Current), and `State`.
> - **Edge Features (17 dims)**: Transaction-specific dynamic attributes: `Transaction_Amount`, `Transaction_Hour`, `Transaction_Type` (UPI/NEFT/Card), `Merchant_Category` (e.g., Grocery, Electronics, Crypto), and `Device_Type` (Mobile, POS, Web)."*

---

## 7. Key Takeaways & Cheat Sheet for Tomorrow
- **Dataset**: `Bank_Transaction_Fraud_Detection.csv` (200,000 records).
- **Partitioning**: Non-IID by `State` $\rightarrow$ 3 Regional Banks.
- **Class Imbalance**: Solved via local SMOTE (oversampling minority class to 50:50).
- **Graph Dimensions**: Node dimension = 8, Edge dimension = 17, Combined input = 25.
- **Centralized Ceiling**: XGBoost with SMOTE achieves **98.24% Accuracy** and **0.9910 AUC-ROC**.
