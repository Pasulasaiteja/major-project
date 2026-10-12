# Product Requirements Document
## Privacy-Preserving Federated Financial Fraud Detection System

**Status:** Draft v1 · **Last updated:** Sep 26, 2026

---

## 1. Summary

A simulated multi-bank system where 3–5 independent "bank" nodes collaboratively train a fraud-detection model without ever sharing raw transaction data. Each bank trains locally; only encrypted/noised model updates are sent to a coordinating server (NVIDIA FLARE), which aggregates them with FedAvg/FedProx into a global model. Differential privacy (DP-SGD) protects the updates themselves, and SHAP/LIME explain every fraud flag.

## 2. Problem

Banks can't pool raw transaction data to train better fraud models — privacy law and competitive sensitivity forbid it. So each bank is stuck with whatever fraud patterns it has personally seen, missing fraud types other banks have already learned to catch. Centralized ML would fix the "not enough data" problem but reintroduces the privacy problem. And even when a model flags a transaction, analysts often can't tell *why*, which slows investigation and erodes trust.

## 3. Goals

- Train a fraud classifier collaboratively across simulated bank nodes with **no raw data leaving any node**.
- Keep model-update leakage bounded using DP-SGD (formal privacy budget, not just "add some noise").
- Produce a human-readable explanation (SHAP, with LIME as backup) for every flagged transaction.
- Hit fraud-detection quality that's competitive with a single centralized model trained on all the data pooled together (the usual federated-learning benchmark).

## 4. Non-goals (for this project's scope)

- Real bank integration or production deployment. This is a **simulation**: 3–5 client processes on one machine/Colab, not real financial institutions.
- Real-time streaming ingestion — batch/near-real-time simulated transactions is sufficient.
- Defending against adversarial/Byzantine clients (model poisoning) — noted as a known gap in the literature review, out of scope unless time permits as a stretch goal.
- Building a production-grade auth system — JWT + role-based access is enough for the dashboard demo.

## 5. Users

| Role | What they need |
|---|---|
| **Bank Client** (simulated) | Trains locally, sees only its own transactions and its own model's predictions. |
| **Fraud Analyst** | Reviews flagged transactions, reads SHAP/LIME explanations, tracks model performance metrics. |
| **Admin / Regulator** | Oversees federated training rounds, confirms privacy compliance (DP budget), manages client onboarding. |

## 6. Functional requirements

**Data pipeline**
- Load per-bank transaction data; handle missing values, encode categoricals, standardize numerics.
- Handle class imbalance (fraud is rare) via SMOTE or equivalent, applied *locally per bank* — never on pooled data.

**Federated training**
- Each bank trains a local model (DNN and/or Gradient Boosting) on its own data only.
- Local model updates (not raw data) are sent to the FLARE server.
- Server aggregates updates via FedAvg (and FedProx as an option for non-uniform/non-IID client data) and redistributes the global model.
- Support multiple federated rounds until convergence criteria are met.

**Privacy**
- DP-SGD applied to local gradients before they leave a bank node: clip gradients, add calibrated noise.
- Track and report the cumulative privacy budget (ε, δ) spent across training rounds.

**Prediction & explainability**
- Global model classifies new transactions as legitimate/fraudulent with a confidence score.
- SHAP (primary) and LIME (secondary) generate per-transaction feature-importance explanations.
- Flagged transactions are blocked/held; legitimate ones pass through and are logged.

**Evaluation**
- Report accuracy, precision, recall, F1, AUC-ROC — per bank and on the aggregated global model.
- Report the privacy budget alongside accuracy (privacy/utility trade-off is a core result of this project, not a side note).

**Dashboard**
- Fraud analysts can view real-time alerts, drill into an explanation, and see performance metrics over training rounds.
- Audit log of predictions and (simulated) admin actions.

## 7. Non-functional requirements

- **Privacy:** raw transaction data must never leave its originating bank node, at any point in the pipeline — this is the core constraint the whole system exists to satisfy.
- **Explainability:** every fraud decision must have an attached explanation; "black box" predictions are not acceptable output.
- **Reproducibility:** federated training must be re-runnable with a fixed seed/config so results can be reported in the final write-up.
- **Modularity:** the six modules (below) should be independently testable — you will very likely be building and debugging FLARE, DP-SGD, and SHAP integration in that order, not all at once.

## 8. Success metrics

- F1-score and AUC-ROC on a held-out global test set, compared against a centralized (non-federated) baseline trained on pooled data — the gap between the two is your headline result.
- Reported (ε, δ) privacy budget at the accuracy level you settle on.
- At least one qualitative example per bank showing a correct SHAP explanation for a true-positive fraud flag.

## 9. Open questions (need answers before/while building)

- **Dataset**: none is currently named in the project report. See the Project Execution Plan doc for options.
- Is GNN in scope as a second model family, or was that a leftover reference from another project? (See note above — recommend dropping it unless intentional.)
- Team size / role split — affects the timeline in the Execution Plan doc.
- Target FLARE deployment mode: FLARE's built-in simulator (fastest to get running) vs. POC/production mode (closer to "real" deployment, more setup).

## 10. Dependencies

Python 3.8+, NVIDIA FLARE, TensorFlow or PyTorch, Scikit-learn, SHAP, LIME, Flask or FastAPI, GPU access (helpful, not strictly required at 3–5 client scale).
