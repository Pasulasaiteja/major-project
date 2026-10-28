# Federated Sentinel: Privacy-Preserving Federated Fraud Detection System

[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://www.python.org/)
[![PyTorch](https://img.shields.io/badge/PyTorch-Deep%20Learning-orange.svg)](https://pytorch.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-High%20Performance-green.svg)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

An enterprise-grade, privacy-preserving fraud detection platform built with **Federated Learning (FedAvg)**, **Differential Privacy (DP-SGD)**, **Explainable AI (SHAP)**, and decentralized **Edge Inference Nodes**.

---

## 📌 Problem Statement & Solution

Financial institutions face a fundamental dilemma: to train high-accuracy fraud detection models, they must aggregate massive volumes of sensitive customer financial data. However, strict privacy regulations (GDPR, RBI guidelines) and data sovereignty concerns prevent banks from sharing raw customer data.

**Federated Sentinel** eliminates this limitation:
- **Decentralized Training**: Models train locally on decentralized bank nodes (e.g. Nagaland Regional Bank, Meghalaya Regional Bank, Uttar Pradesh Gramin Bank).
- **Zero Raw Data Sharing**: Only encrypted model weight updates are aggregated centrally via Federated Averaging (`FedAvg`).
- **Mathematical Privacy Guarantees**: Differential Privacy (`DP-SGD`) with gradient clipping and Gaussian noise prevents reconstruction or membership inference attacks.
- **Explainable AI (XAI)**: SHAP-based feature attribution translates black-box model inferences into plain English explanations for banking clients.
- **Edge Inference & Client Portal**: Fast edge prediction, automated threat holds, and a modern client web application with real-time dispute & ticket tracking.

---

## 🏛️ System Architecture

```text
+-----------------------------------------------------------------------------------+
|                            CENTRAL FEDERATED COORDINATOR                          |
|                       Aggregates Weights (FedAvg) + Global Model                  |
+-----------------------------------------------------------------------------------+
             ▲                                ▲                               ▲
    Encrypted Weights                Encrypted Weights               Encrypted Weights
             │                                │                               │
             ▼                                ▼                               ▼
+-------------------------+      +-------------------------+      +-------------------------+
|     BANK NODE 1         |      |     BANK NODE 2         |      |     BANK NODE 3         |
| Nagaland Regional Bank  |      | Meghalaya Regional Bank |      | UP Gramin Bank          |
|  - Private Local Data   |      |  - Private Local Data   |      |  - Private Local Data   |
|  - Local DNN Training   |      |  - Local DNN Training   |      |  - Local DNN Training   |
|  - Edge Inference API   |      |  - Edge Inference API   |      |  - Edge Inference API   |
+-------------------------+      +-------------------------+      +-------------------------+
             │                                │                               │
             └────────────────────────────────┴───────────────────────────────┘
                                              │
                                              ▼
                             +--------------------------------+
                             |     CLIENT BANKING WEB APP     |
                             |  - Secure MPIN Login           |
                             |  - Multi-Bank User Switcher    |
                             |  - Fraud Alert & SHAP Holds    |
                             |  - Investigation Tickets & UAT |
                             +--------------------------------+
```

---

## 🚀 Key Features

1. **Decentralized Edge Inference**: Real-time fraud scoring performed on bank-isolated inference instances.
2. **Explainable AI (SHAP Analysis)**: Human-interpretable explanations of why any given transaction was flagged.
3. **Multi-Bank Account Switcher**: Switch between accounts across regional banks with live MPIN verification.
4. **Fraud Investigation Ticket System**: Raise dispute tickets with urgency levels, contact preferences, and real-time audit timelines.
5. **Simulated Federated Defense**: Built-in demonstration tools to test live transaction anomalies and observe edge defenses.

---

## 🛠️ Tech Stack

- **Machine Learning**: PyTorch (`FraudDNN`), Scikit-Learn, SHAP, NumPy, Pandas
- **Backend & Edge APIs**: Python, FastAPI, Uvicorn, Pydantic, HTTPX
- **Frontend**: Vanilla JavaScript (SPA Architecture), Tailwind CSS, Material Symbols
- **Testing**: PyTest automated suite

---

## 💻 Quick Start & Running Locally

### 1. Clone the Repository
```bash
git clone https://github.com/Pasulasaiteja/major-project.git
cd major-project
```

### 2. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run the Backend & Edge Node
```bash
# Start the central coordinator / bank edge API (port 8000/8001)
python -m uvicorn src.api.server:app --port 8001 --reload
```

### 4. Run the Client Web Portal
```bash
# Serve the frontend directory using Node / Python HTTP server
cd frontend
npx serve -l 3000 .
# Or: python -m http.server 3000
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🧪 Demo Credentials

### 👤 Client Banking Portal (`/login`)
- **Rajesh Sharma**: `9988776655` | MPIN: `4321` | Bank: **Nagaland Regional Bank**
- **User 1230**: `9874561230` | MPIN: `4444` | Bank: **Nagaland Regional Bank**
- **Demo User**: `9876543210` | MPIN: `1234` | Bank: **Nagaland Regional Bank**

### 🛡️ Branch Manager Operations Portal (`/manager-login`)
Used by bank fraud investigators to inspect flagged anomalies, review SHAP rationales, and resolve customer dispute tickets:

| Regional Bank Node | Manager ID | Manager Name | PIN | Portal Route |
| :--- | :--- | :--- | :---: | :--- |
| **Bank 1 (Nagaland Regional Bank)** | `MGR-NRB-001` | Anurag Kapoor | `112233` | `/manager-login` $\to$ `/manager-portal` |
| **Bank 2 (Meghalaya Regional Bank)** | `MGR-MRB-001` | Priya Deshpande | `223344` | `/manager-login` $\to$ `/manager-portal` |
| **Bank 3 (UP Gramin Bank)** | `MGR-UPG-001` | Suresh Yadav | `334455` | `/manager-login` $\to$ `/manager-portal` |

---

## 👨‍💻 Author
- **Pasula Sai Teja** ([@Pasulasaiteja](https://github.com/Pasulasaiteja))
