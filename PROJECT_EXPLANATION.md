# Federated Sentinel: Privacy-Preserving Federated Fraud Detection System
## B.Tech Major Project Presentation & Technical Overview

---

## 1. Executive Summary
Financial institutions face a critical dilemma: to build robust, highly accurate fraud detection models, they must aggregate massive volumes of sensitive customer transaction data. However, strict privacy regulations (such as GDPR and RBI guidelines) and data sovereignty concerns prevent banks from sharing raw customer data.

**Federated Sentinel** solves this dilemma by introducing a **Privacy-Preserving Federated Learning & Edge AI Architecture**. Instead of centralizing raw financial data, models are trained collaboratively and locally on decentralized bank nodes. Only encrypted model weight updates are shared across the network, ensuring absolute data privacy while achieving state-of-the-art global fraud detection accuracy.

---

## 2. Key Architecture & Workflows

### A. Flow A: Federated Training & Differential Privacy
- **Decentralized Data Partitioning**: Data is partitioned across distinct regional bank nodes (e.g., Nagaland Regional Bank, Meghalaya Regional Bank, Uttar Pradesh Gramin Bank).
- **Federated Averaging (FedAvg)**: Local neural network models (`FraudDNN`) train independently on each bank's private dataset for multiple rounds. Only weight parameters are aggregated centrally.
- **Differential Privacy (DP-SGD)**: Gaussian noise and gradient clipping are applied during training to guarantee mathematical privacy bounds ($\epsilon$-differential privacy), preventing reconstruction attacks or membership inference.

### B. Flow B: Decentralized Edge Inference
- **On-Premise Deployment**: Once the global model weights (`global_weights.pth`) are finalized, each bank hosts a local edge inference API (`bank_edge_api.py`).
- **Data Sovereignty**: Incoming customer transactions are classified **entirely on the local bank's machine**. Customer data never leaves the bank's secure network perimeter.

---

## 3. Explainable AI (XAI) with SHAP
Black-box deep learning models are notoriously difficult to trust in banking. Federated Sentinel integrates **SHAP (SHapley Additive exPlanations)** via Gradient Explainer to compute exact feature attribution scores for every transaction.
- **Plain English Summaries**: Complex neural network risk scores are automatically translated into clear, human-readable explanations (e.g., *"This transaction was flagged as Fraud primarily due to the unusually high transaction amount and a suspicious geographical pattern."*).
- **Client Empowerment**: Users can instantly review why a hold was placed and resolve safe transactions without calling customer support.

---

## 4. Tech Stack

- **Backend & APIs**: Python, FastAPI, Uvicorn, Pydantic, HTTPX.
- **Machine Learning & Deep Learning**: PyTorch, Scikit-Learn, SHAP, NumPy, Pandas.
- **Frontend**: Vanilla JavaScript (SPA Router), Tailwind CSS, Material Symbols.
- **Testing**: PyTest for robust automated backend and edge API verification.

---

## 5. System Demonstration & Testing

### Demo Credentials for Client Login Portal
- **Account Number**: `1234567890`
- **MPIN / PIN**: `1234`
- **Bank Node**: Nagaland Regional Bank (Port `8001`)

### Key Interactive Features
1. **Client Dashboard**: View live account balance, active protection status, and real-time transaction scans.
2. **Instant Threat Hold & Review**: Inspect flagged fraudulent transactions with detailed SHAP risk indicators and authorize or report them instantly.
3. **Fraud Specialist Portal**: Monitor global model accuracy, training rounds, differential privacy budgets ($\epsilon$), and connected edge node statuses.

---

## 6. Visual Architecture & Pipeline Diagrams

The comprehensive architectural diagrams illustrating the **Federated Learning Training Pipeline (Flow A)**, **Decentralized Data Flow (Flow B)**, and the **Prediction Flagging & Frontend Resolution Lifecycle** have been generated and saved to `architecture_diagrams.svg`. 

You can view `architecture_diagrams.svg` directly in any SVG viewer or browser. Here is a summary of the three integrated flows shown in the diagram:

1. **Federated Training Pipeline (Flow A)**: Shows regional bank nodes training models locally on private data and sending only encrypted weight updates to the Central Aggregator (FedAvg + DP-SGD), which broadcasts the updated global weights (`global_weights.pth`).
2. **Decentralized Data Flow (Flow B)**: Illustrates how customer transactions are submitted directly to the local Bank Edge API (`bank_edge_api.py`) where inference runs on-premise without raw data ever leaving the bank.
3. **Prediction, SHAP & Frontend Lifecycle**: Demonstrates the step-by-step pipeline from PyTorch risk scoring and SHAP explainability generation, to alert database storage (`blocked` status), and rendering in the client SPA dashboard (`/dashboard` and `/hold-reason` pages).
