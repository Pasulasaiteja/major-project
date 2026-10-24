# Research Literature Guide: Federated Sentinel
## Privacy-Preserving Federated GNN Fraud Detection with Differential Privacy and Explainable AI

This guide is structured to help you locate, filter, and review **30 high-impact research papers** across the core pillars of the **Federated Sentinel** architecture:
1. **Federated Learning in Financial Fraud Detection (Cross-Silo FL, Non-IID Data)**
2. **Graph Neural Networks (GNNs) for Financial Transaction Graphs & Anomaly Detection**
3. **Differential Privacy (DP) & Secure Collaborative Learning**
4. **Explainable AI (XAI / SHAP) in Automated Fraud & Credit Scoring**
5. **Federated Edge Computing & Human-in-the-Loop Financial Dispute Systems**

---

## 1. Paper Allocation Matrix (Target: 30 Papers)

| Pillar | Focus Area | Target Count | Key Databases |
| :--- | :--- | :--- | :--- |
| **Pillar 1** | Federated Learning for Banking & Credit Card Fraud | 7 – 8 Papers | IEEE Xplore, ACM DL, Google Scholar |
| **Pillar 2** | Graph Neural Networks (GNNs) on Transaction Graphs | 7 – 8 Papers | NeurIPS, ICLR, KDD, IEEE Transactions |
| **Pillar 3** | Differential Privacy (DP-FedAvg, Noise, Privacy Budget) | 6 – 7 Papers | USENIX Security, IEEE S&P, ACM CCS |
| **Pillar 4** | Explainable AI (SHAP, Post-Hoc Interpretability in Finance) | 5 – 6 Papers | Expert Systems with Applications, AAAI |
| **Pillar 5** | Edge Inference & Human-in-the-Loop Dispute Lifecycle | 4 – 5 Papers | IEEE Internet of Things, Future Generation Comp. |
| **Total** | **Comprehensive Literature Survey** | **30+ Papers** | **Top Venues / Peer-Reviewed** |

---

## 2. Keywords & Boolean Query Strings

### Pillar 1: Federated Learning for Financial Fraud Detection
* **Keywords**: `Federated Learning`, `Cross-Silo FL`, `Credit Card Fraud Detection`, `Financial Anomaly Detection`, `FedAvg`, `Non-IID Distribution`, `Collaborative Banking`.
* **Boolean Search Query**:
  ```text
  ("federated learning" OR "cross-silo federated learning") AND ("fraud detection" OR "credit card fraud" OR "financial transactions") AND ("non-IID" OR "FedAvg" OR "collaborative learning")
  ```

### Pillar 2: Graph Neural Networks (GNNs) for Fraud & Transaction Networks
* **Keywords**: `Graph Neural Networks`, `FraudGNN`, `Graph Convolutional Networks`, `Transaction Graph`, `Heterogeneous Graph`, `Node Classification`, `Edge Attributed Graph`.
* **Boolean Search Query**:
  ```text
  ("graph neural network" OR "GNN" OR "graph convolutional network" OR "graph attention network") AND ("fraud detection" OR "financial transaction network" OR "anti-money laundering") AND ("heterogeneous" OR "edge features" OR "imbalanced data")
  ```

### Pillar 3: Differential Privacy & Secure Collaborative Training
* **Keywords**: `Differential Privacy`, `DP-FedAvg`, `Privacy Budget`, `Laplace Mechanism`, `Gaussian Mechanism`, `Gradient Clipping`, `Membership Inference Attack`, `Data Leakage`.
* **Boolean Search Query**:
  ```text
  ("differential privacy" OR "privacy-preserving" OR "local differential privacy") AND ("federated learning" OR "distributed learning") AND ("fraud detection" OR "banking" OR "privacy budget" OR "gradient clipping")
  ```

### Pillar 4: Explainable AI (XAI) & SHAP in Financial Decisioning
* **Keywords**: `Explainable AI`, `XAI`, `SHAP`, `Shapley Additive Explanations`, `Model Interpretability`, `GradientExplainer`, `Feature Attribution`, `Black-Box Explanation`.
* **Boolean Search Query**:
  ```text
  ("explainable AI" OR "XAI" OR "SHAP" OR "Shapley Additive Explanations") AND ("fraud detection" OR "financial transactions" OR "credit risk") AND ("interpretability" OR "feature attribution")
  ```

### Pillar 5: Combined Architecture (FedGNN + Edge Inference + Dispute Lifecycle)
* **Keywords**: `Federated Graph Neural Networks`, `FedGNN`, `Edge Computing Fraud Detection`, `On-Premise Privacy`, `Human-in-the-loop Verification`.
* **Boolean Search Query**:
  ```text
  ("federated graph neural network" OR "FedGNN" OR "federated graph learning") AND ("fraud detection" OR "privacy-preserving" OR "edge computing")
  ```

---

## 3. Natural Language AI Prompts
*Use these exact prompts in **Google Scholar AI, Consensus, Scite, Elicit, Perplexity, or ChatGPT/Gemini**.*

### Prompt 1 (Federated Learning in Banking)
> *"What are the most cited peer-reviewed research papers (2019–2025) implementing cross-silo federated learning for financial transaction fraud detection across distributed banks with non-IID data partitions?"*

### Prompt 2 (GNNs on Transaction Graphs)
> *"Find benchmark papers and surveys on using Graph Neural Networks (such as GCN, GAT, and heterogeneous GNNs) for detecting fraud and anti-money laundering patterns in tabular transaction graphs with edge attributes."*

### Prompt 3 (Differential Privacy in Federated Financial Systems)
> *"Which research papers investigate the trade-off between differential privacy (DP-SGD, Laplace noise, gradient clipping, epsilon budget) and classification accuracy in federated fraud detection models?"*

### Prompt 4 (Explainable AI & SHAP in Fraud Systems)
> *"What research papers explore post-hoc explainability methods, specifically KernelSHAP, TreeSHAP, and GradientExplainer, for interpreting deep learning and GNN fraud predictions for banking investigators and end customers?"*

### Prompt 5 (Federated GNN Architectures)
> *"Provide seminal and recent research papers on Federated Graph Neural Networks (FedGNN / Federated Graph Learning) designed for distributed, privacy-preserving node and edge classification in financial networks."*

### Prompt 6 (Edge-Local Inference & Data Residency Constraints)
> *"What papers analyze privacy-preserving edge inference architectures where customer banking data cannot legally leave local on-premise storage and model updates are shared via secure aggregation?"*

---

## 4. Benchmark & Foundational Papers to Cite First

Every reviewer and academic committee will expect your literature review to cite these milestone papers:

### A. Federated Learning Foundations
1. **McMahan, B., Moore, E., Ramage, D., Hampson, S., & y Arcas, B. A. (2017)**  
   *Communication-Efficient Learning of Deep Networks from Decentralized Data (AISTATS)*  
   *Relevance*: The original paper introducing **FedAvg**, the core aggregation algorithm in your project.
2. **Yang, Q., Liu, Y., Chen, T., & Tong, Y. (2019)**  
   *Federated Machine Learning: Concept and Applications (ACM TIST)*  
   *Relevance*: Distinguishes horizontal, vertical, and cross-silo federated learning in corporate/banking sectors.
3. **Li, T., Sahu, A. K., Talwalkar, A., & Smith, V. (2020)**  
   *Federated Learning: Challenges, Methods, and Future Directions (IEEE SPM)*  
   *Relevance*: Addresses non-IID statistical heterogeneity across distinct regional bank datasets.

### B. Graph Neural Networks for Fraud Detection
4. **Dou, Y., Liu, Z., Sun, L., Deng, Y., Peng, H., & Yu, P. S. (2020)**  
   *Enhancing Graph Neural Network-based Fraud Detectors against Camouflaged Fraudsters (ACM CIKM)*  
   *Relevance*: Introduces CARE-GNN; addresses fraud camouflage and relation weighting in transaction graphs.
5. **Wang, D., Lin, J., Cui, P., Jia, Q., Wang, Z., Fang, Y., ... & Yang, S. (2019)**  
   *A Semi-supervised Graph Attentive Network for Financial Fraud Detection (IEEE ICDM)*  
   *Relevance*: Applies attention mechanisms to heterogeneous financial transaction networks with edge attributes.
6. **He, C., Balasubramanian, K., Ceyani, E., et al. (2021)**  
   *FedGraphNN: A Federated Learning System and Benchmark for Graph Neural Networks (NeurIPS Workshop)*  
   *Relevance*: Foundational framework for training GNNs over distributed, private subgraphs.

### C. Differential Privacy Foundations
7. **Dwork, C., & Roth, A. (2014)**  
   *The Algorithmic Foundations of Differential Privacy (Foundations and Trends in Theoretical Computer Science)*  
   *Relevance*: Theoretical basis for $(\epsilon, \delta)$-differential privacy and Laplace/Gaussian noise mechanisms.
8. **Abadi, M., Chu, A., Goodfellow, I., McMahan, H. B., et al. (2016)**  
   *Deep Learning with Differential Privacy (ACM CCS)*  
   *Relevance*: Establishes gradient clipping and moments accountant for private deep learning models.

### D. Explainable AI & Feature Attribution
9. **Lundberg, S. M., & Lee, S. I. (2017)**  
   *A Unified Approach to Interpreting Model Predictions (NeurIPS)*  
   *Relevance*: Introduces **SHAP (Shapley Additive Explanations)**, used by your edge API for plain-English explanations.
10. **Sundararajan, M., Taly, A., & Yan, Q. (2017)**  
    *Axiomatic Attribution for Deep Networks (ICML)*  
    *Relevance*: Integrated gradients and gradient-based attribution for deep neural network decision paths.

---

## 5. Literature Review Summary Table Template

Use this table template to catalog your 30 papers in your project documentation or thesis chapter:

| # | Paper Title | Authors & Year | Publication Venue | Core Methodology | Privacy / XAI Technique | Primary Dataset | Key Limitations Identified |
|---|-------------|----------------|-------------------|------------------|-------------------------|-----------------|---------------------------|
| 1 | Communication-Efficient Learning... | McMahan et al. (2017) | AISTATS | FedAvg aggregation | Decentralized weights | MNIST / Shakespeare | No edge DP or XAI |
| 2 | Enhancing GNN-based Fraud Detectors... | Dou et al. (2020) | ACM CIKM | CARE-GNN (RL neighbor sampling) | Feature importance | Yelp / Amazon Fraud | Centralized; no privacy guarantee |
| 3 | Deep Learning with Differential Privacy | Abadi et al. (2016) | ACM CCS | DP-SGD + Gradient Clipping | $(\epsilon, \delta)$-DP | MNIST / CIFAR-10 | Utility loss under strict $\epsilon$ |
| 4 | A Unified Approach to Interpreting... | Lundberg & Lee (2017) | NeurIPS | Shapley additive values | SHAP Feature Attribution | Benchmark datasets | High computational cost on GNNs |
| ... | *[Add Papers 5 to 30]* | | | | | | |

---

## 6. Synthesis Strategies for Your Project Defense / Thesis

When synthesizing these papers in your report, compare your project against the literature by answering:
1. **The Gap in Prior Work**: Most existing fraud detection literature is either **centralized** (violates bank privacy regulations like GDPR/RBI) or applies standard federated learning on flat tabular data **without relational graph topology**.
2. **Federated Sentinel's Contribution**: Combines **Graph Neural Networks (FraudGNN)** with **Cross-Silo Federated Learning (`FedAvg`)**, enforces **Differential Privacy ($\epsilon$-budget)** against model inversion, and integrates **SHAP GradientExplainer** for actionable, plain-English client transparency and branch manager dispute management.
