# 📊 Module: Data Processing
## B.Tech Major Project — Individual Contribution & Viva Examination Guide
**System:** Federated Sentinel: Privacy-Preserving Federated Fraud Detection System  
**Module Name:** **Data Processing** (Module 1 of 4)

---

## 👤 Team Member Profile & Viva Pitch
- **Assigned Team Member**: Student 1 (Data Processing Lead)
- **Core Codebase Files**:
  - `Bank_Transaction_Fraud_Detection.csv` (Primary raw banking dataset)
  - `src/ml_pipeline/split_data.py` (Non-IID geographic bank partitioner)
  - `src/ml_pipeline/baseline.py` (Centralized baseline preprocessing & ImbPipeline)
  - `src/ml_pipeline/dp_federated_avg.py` (Node & Edge ColumnTransformers, SMOTE, PyTorch Geometric Graph datasets)
- **30-Second Elevator Pitch to Sir / External Examiner**:
  > *"Sir, I am responsible for the **Data Processing** module of our project. In real-world banking, data is heavily imbalanced, multi-modal, and cannot be shared across institutions. I built an end-to-end data pipeline that cleans and transforms over 200,000 raw financial transactions. First, I developed a Non-IID partitioning engine that divides data into independent regional bank nodes based on geographic territory. Second, I resolved severe class imbalance (~1.5% fraud) using locally scoped SMOTE to prevent synthetic data leakage. Third, I decoupled features into demographic Node attributes and transactional Edge attributes, scaling them via Scikit-Learn ColumnTransformers. Finally, I converted these tabular matrices into PyTorch Geometric graph structures (`torch_geometric.data.Data`), establishing the data foundation for our deep learning models."*

---

## 1. Module Overview & Problem Statement

### 1.1 Why Data Processing is Critical in Financial Fraud
Raw financial ledgers are notoriously messy, heterogeneous, and skewed. Feeding raw tabular rows directly into deep learning models produces poor generalization and severe false-alarm rates. 

The three critical challenges solved in this module:
1. **Extreme Class Imbalance (The 98.5% Trap)**:
   - In our raw dataset of 200,000+ transactions, legitimate transactions comprise ~98.5%, while confirmed fraudulent transactions represent only ~1.5%.
   - A naive model predicting "Non-Fraud" 100% of the time achieves an ostensibly high 98.5% accuracy while catching **0% of fraud attacks**.
2. **Non-IID Cross-Silo Distribution (Simulating Autonomous Banks)**:
   - Centralized machine learning assumes data is Identically and Independently Distributed (IID).
   - In reality, banks operate in distinct regions with different spending powers, merchant densities, and customer demographics. Random splits create identical datasets that do not reflect real-world banking silos.
3. **Multi-Modal Feature Decoupling (Nodes vs. Edges)**:
   - Banking transactions consist of two fundamentally different types of information: **Customer Profile state** (static/slow-changing) and **Transaction Event dynamics** (high-frequency, real-time).
   - These must be transformed separately using custom mathematical encoders before feeding Graph Neural Networks.

---

## 2. Technical Architecture & Data Transformation Pipeline

```
+===================================================================================================+
|                                    MODULE 1: DATA PROCESSING PIPELINE                             |
+===================================================================================================+

   [Raw Transaction CSV] -> `Bank_Transaction_Fraud_Detection.csv` (~68 MB, 200,000+ rows)
                                      │
                                      ▼
             [STAGE 1: NON-IID REGIONAL PARTITIONING] (`split_data.py`)
             Subsets records by top geographic states into isolated silos:
             - Bank 1: Nagaland Regional Bank (`bank_1_Nagaland.csv`)
             - Bank 2: Meghalaya Regional Bank (`bank_2_Meghalaya.csv`)
             - Bank 3: Uttar Pradesh Gramin Bank (`bank_3_Uttar Pradesh.csv`)
                                      │
                                      ▼
             [STAGE 2: LOCAL FEATURE DECOUPLING & ENCODING] (`dp_federated_avg.py`)
             +----------------------------------+----------------------------------+
             |      NODE DEMOGRAPHIC SPACE      |     EDGE TRANSACTIONAL SPACE     |
             |----------------------------------|----------------------------------|
             | Numeric (StandardScaler):        | Numeric (StandardScaler):        |
             |  - `Age`                         |  - `Transaction_Amount`          |
             |  - `Account_Balance`             |  - `Transaction_Hour`            |
             | Categorical (OneHotEncoder):     | Categorical (OneHotEncoder):     |
             |  - `Gender`                      |  - `Transaction_Type`            |
             |  - `Account_Type`                |  - `Merchant_Category`           |
             |  - `State`                       |  - `Device_Type`                 |
             | Dimension: 8 features            | Dimension: 17 features           |
             +----------------------------------+----------------------------------+
                                      │
                                      ▼
             [STAGE 3: LOCALLY SCOPED SMOTE BALANCING]
             - Resamples minority fraud class strictly inside each bank's local boundary
             - Balances class ratio from 1.5% : 98.5% -> 50% : 50%
             - Train / Test stratified split (80% Train, 20% Held-out Test)
                                      │
                                      ▼
             [STAGE 4: PYTORCH GEOMETRIC GRAPH INSTANTIATION]
             - Constructs node tensor `X` in R^{N x 8}
             - Constructs edge attribute tensor `edge_attr` in R^{N x 17}
             - Generates topological connectivity `edge_index` in R^{2 x 2N}
             - Wraps into `torch_geometric.data.Data` objects for GNN consumption
```

---

## 3. Mathematical Foundations

### 3.1 Non-IID Partitioning Formulation
Let the global financial transaction distribution be $\mathcal{P}(X, Y)$. Standard random sampling draws client subsets such that:
$$\mathcal{P}_1(X, Y) = \mathcal{P}_2(X, Y) = \dots = \mathcal{P}_K(X, Y)$$

In our module, we enforce **Covariate Shift / Non-IID Partitioning**:
$$\mathcal{P}_i(X) \neq \mathcal{P}_j(X) \quad \text{for } i \neq j$$
We define each bank's private local dataset $\mathcal{D}_k$ by conditioning on the territory feature $\mathcal{S}_k$:
$$\mathcal{D}_k = \left\{ (x_i, y_i) \in \mathcal{D}_{\text{global}} \mid \text{State}(x_i) = \mathcal{S}_k \right\}$$
where $\mathcal{S}_1 = \text{Nagaland}$, $\mathcal{S}_2 = \text{Meghalaya}$, and $\mathcal{S}_3 = \text{Uttar Pradesh}$.

---

### 3.2 Synthetic Minority Over-sampling Technique (SMOTE)
To prevent the model from collapsing to the majority class without introducing test leakage, SMOTE creates synthetic instances along feature-space line segments.

For each minority fraud instance $\mathbf{x}_i \in \mathcal{X}_{\text{fraud}}$:
1. Find its $k$-nearest neighbors within $\mathcal{X}_{\text{fraud}}$ using Euclidean distance:
   $$d(\mathbf{x}_i, \mathbf{x}_j) = \sqrt{\sum_{m=1}^D (x_{im} - x_{jm})^2}$$
2. Randomly select one neighbor $\mathbf{x}_{\text{nn}} \in \mathcal{N}_k(\mathbf{x}_i)$.
3. Synthesize a new sample:
   $$\mathbf{x}_{\text{synthetic}} = \mathbf{x}_i + \lambda (\mathbf{x}_{\text{nn}} - \mathbf{x}_i), \quad \lambda \sim \mathcal{U}(0, 1)$$

*Crucial Architecture Decision*: SMOTE is executed **locally per bank partition**. Applying SMOTE globally across pooled bank data would cause illegal cross-institutional data leakage.

---

### 3.3 Feature Scaling & One-Hot Encoding Formulations
1. **Z-Score Normalization (StandardScaler)**:
   $$z = \frac{x - \mu}{\sigma} = \frac{x - \frac{1}{N}\sum_{i=1}^N x_i}{\sqrt{\frac{1}{N}\sum_{i=1}^N (x_i - \mu)^2}}$$
   Applied to `Age`, `Account_Balance`, `Transaction_Amount`, and `Transaction_Hour`.
2. **One-Hot Categorical Encoding**:
   For categorical variable $c \in \{1, \dots, C\}$:
   $$\mathbf{v}_{\text{enc}} = [0, \dots, 1, \dots, 0] \in \{0, 1\}^C$$
   Applied to `Gender` (2), `Account_Type` (2), `State` (3+), `Transaction_Type` (UPI, NEFT, Card, etc.), `Merchant_Category` (Grocery, Crypto, Electronics, etc.), and `Device_Type` (Mobile, Web, POS, ATM).

---

## 4. Code Walkthrough & Implementation Details

### 4.1 Non-IID Splitting (`src/ml_pipeline/split_data.py`)
```python
def split_dataset_by_state(input_file, output_dir, num_banks=3):
    df = pd.read_csv(input_file)
    # Extracts top states by transaction volume
    top_states = df['State'].value_counts().nlargest(num_banks).index.tolist()
    os.makedirs(output_dir, exist_ok=True)
    
    for i, state in enumerate(top_states, start=1):
        bank_df = df[df['State'] == state]
        output_path = os.path.join(output_dir, f'bank_{i}_{state}.csv')
        bank_df.to_csv(output_path, index=False)
```
- **Line-by-line explanation**: Subsets the massive 200k CSV into three isolated bank databases in `data/partitioned_banks/`. Each CSV acts as an on-premise local data store.

### 4.2 Centralized Baseline Pipeline (`src/ml_pipeline/baseline.py`)
```python
def train_baseline_model(file_path):
    X, y, preprocessor = load_and_preprocess_data(file_path)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # ImbPipeline ensures SMOTE is applied only during fit, never during predict
    model = ImbPipeline([
        ('preprocessor', preprocessor),
        ('smote', SMOTE(random_state=42)),
        ('classifier', xgb.XGBClassifier(use_label_encoder=False, eval_metric='logloss', random_state=42))
    ])
    model.fit(X_train, y_train)
```
- **Why `ImbPipeline`?**: Standard scikit-learn pipelines do not support resamplers like SMOTE. `imblearn.pipeline.Pipeline` wraps SMOTE so that oversampling is executed strictly on the training folds, preventing test set corruption.

### 4.3 Node & Edge Preprocessors & PyTorch Geometric Data (`src/ml_pipeline/dp_federated_avg.py`)
```python
def build_feature_preprocessors(df):
    node_num = ['Age', 'Account_Balance']
    node_cat = ['Gender', 'Account_Type', 'State']
    node_prep = ColumnTransformer([
        ('num', StandardScaler(), node_num),
        ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), node_cat)
    ])
    node_prep.fit(df[node_num + node_cat])

    edge_num = ['Transaction_Amount', 'Transaction_Hour']
    edge_cat = ['Transaction_Type', 'Merchant_Category', 'Device_Type']
    edge_prep = ColumnTransformer([
        ('num', StandardScaler(), edge_num),
        ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), edge_cat)
    ])
    edge_prep.fit(df[edge_num + edge_cat])
    return node_prep, edge_prep, ...
```
- **PyTorch Geometric Graph Object Generation**:
```python
# Construct Data instance
graph_data = Data(
    x=torch.FloatTensor(X_resampled[:, :node_dim]),          # [N, 8]  - Node Demographics
    edge_index=edge_index,                                   # [2, 2N] - Relational Topologies
    edge_attr=torch.FloatTensor(X_resampled[:, node_dim:]),  # [N, 17] - Transaction Attributes
    y=torch.FloatTensor(y_resampled).unsqueeze(1)            # [N, 1]  - Fraud Labels
)
```

---

## 5. Live Demonstration Commands for Tomorrow

When Sir asks you to demonstrate your module, open the terminal and run:

```bash
# 1. Execute data partitioning into 3 regional banks
python src/ml_pipeline/split_data.py
```
*Output*: Confirms generation of `bank_1_Nagaland.csv`, `bank_2_Meghalaya.csv`, `bank_3_Uttar Pradesh.csv`.

```bash
# 2. Run the Centralized Benchmark Pipeline
python src/ml_pipeline/baseline.py
```
*Output*:
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

## 6. Viva Voce Examination Preparation ("Sir's Questions & Answers")

#### Q1: "Why did you separate features into Node Features and Edge Features?"
**Answer**:
> *"Sir, financial transactions are naturally heterogeneous. Customer attributes like `Age`, `Account_Balance`, `Account_Type`, and `State` belong to the **account holder (Node)** and remain relatively static. In contrast, `Transaction_Amount`, `Transaction_Hour`, `Merchant_Category`, and `Device_Type` belong to the **transaction event (Edge)**. Decoupling them allows our Graph Neural Network to run neighborhood aggregations across customer nodes while projecting transaction dynamics independently."*

#### Q2: "Why didn't you just use standard Random Undersampling instead of SMOTE?"
**Answer**:
> *"Sir, with a 1.5% fraud rate, undersampling down to a 1:1 ratio would discard over 97% of legitimate transactions. That would discard critical variance regarding valid spending behaviors, causing massive false-positive alarms in production. SMOTE synthesizes realistic fraud cases in feature space, preserving 100% of legitimate data variance while giving the classifier a dense boundary."*

#### Q3: "What would happen if you applied SMOTE before partitioning the data into banks?"
**Answer**:
> *"Sir, that would be a catastrophic violation of federated learning principles and cause cross-institutional data leakage. In federated learning, banks are completely isolated. Applying SMOTE centrally would mean synthetic transactions could interpolate between Bank 1's customers and Bank 2's customers. In our pipeline, SMOTE is strictly scoped inside each bank's local training split."*

#### Q4: "What is the baseline model and why did you build it?"
**Answer**:
> *"Sir, I built the centralized XGBoost model as a **theoretical upper bound / accuracy ceiling**. It is trained assuming an illegal scenario where all banks pool all their data into a single central server. It achieves 98.24% accuracy and 0.9910 AUC-ROC. This benchmark allows our team to measure the exact performance gap of federated learning and quantify the cost of privacy."*

#### Q5: "How are timestamps and transaction hours handled?"
**Answer**:
> *"Sir, raw timestamps formatted as `HH:MM:SS` cannot be consumed directly by neural networks. In our pipeline, we extract the `Transaction_Hour` as a continuous float $[0.0, 23.0]$ and scale it using `StandardScaler`. This allows the model to learn diurnal patterns—such as detecting fraudulent spikes occurring during odd early morning hours (2:00 AM – 4:00 AM)."*

---

## 7. Summary Checklist for Tomorrow
- [x] Partitioning logic explained (Non-IID by State).
- [x] Class imbalance resolved via local SMOTE.
- [x] Node dimensions (8) & Edge dimensions (17) memorized.
- [x] `ImbPipeline` justification prepared.
- [x] Centralized baseline benchmark (98.24% accuracy, 0.9910 AUC-ROC) ready to present.
