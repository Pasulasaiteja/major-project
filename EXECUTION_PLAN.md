# Project Execution Plan
## Privacy-Preserving Federated Financial Fraud Detection System

**Status:** Draft v1 · **Last updated:** Sep 26, 2026
**Why this doc exists:** the original report describes *what* the system does but never says what dataset to use, how to set up the environment, or in what order to build things. This fills that gap.

---

## 1. Dataset (currently undecided — pick one before doing anything else)

| Option | Why it fits | Watch out for |
|---|---|---|
| **IEEE-CIS Fraud Detection** (Kaggle) | Real anonymized transaction data, ~590K rows, widely benchmarked — easy to compare your results against published numbers. | Single source, not naturally split by "bank" — you'll need to partition it yourself (see below). |
| **PaySim** (synthetic, mobile money) | Explicitly designed to simulate multiple agents/transaction types; easy to generate more data if you need it. | Synthetic fraud patterns are simpler than real ones — fine for a class project, say so in your report's limitations. |
| **Credit Card Fraud (ULB/Kaggle)** | Small (~285K rows), fast to iterate on while debugging FLARE — good for your *first* end-to-end run before switching to a bigger set. | Very imbalanced (~0.17% fraud) — SMOTE is not optional here. |

**Recommendation:** start with the ULB Credit Card dataset to get FLARE + DP-SGD + SHAP working end-to-end fast (small, fast iteration), then move to IEEE-CIS for your final reported numbers.

**Simulating multiple banks from one dataset:** since none of these datasets are natively split by institution, partition by a proxy field that creates realistic non-IID splits (e.g., by a merchant-category or geography column) rather than a random split — random splits make every "bank" look identical, which defeats the point of federated learning and won't produce an interesting result for FedProx to solve.

## 2. Environment setup

1. Python 3.8+ (3.10 recommended for current library compatibility).
2. `pip install nvflare torch scikit-learn shap lime pandas numpy flask` (swap `torch` for `tensorflow` if going the TF route — pick one, don't split effort across both).
3. NVIDIA FLARE: start with the **FLARE Simulator** (`nvflare simulator`) — runs all client nodes as local processes, no real networking/cert setup needed. Only move to POC mode later if you specifically want to demo "real" deployment.
4. GPU is a nice-to-have at this scale (3–5 small clients), not a blocker — Colab's free GPU tier or a laptop CPU both work for prototyping.
5. VS Code for development, Colab for anything GPU-heavy or for sharing a runnable notebook with teammates.

## 3. Build order (this is your "Project Flow Diagram," turned into a checklist)

Build in this order — each stage should run and produce a number before you move to the next one. Don't start DP-SGD or SHAP until plain FedAvg works.

1. **Baseline (no federation):** train a single DNN or Gradient Boosting model on the full pooled dataset. This is your accuracy ceiling / comparison point.
2. **Single-node pipeline:** preprocessing + SMOTE + local training working for one simulated bank, no FLARE yet.
3. **Federated wiring:** get FLARE Simulator running with 3 clients doing plain FedAvg, no privacy or explainability yet. Confirm the global model's accuracy is close to your baseline.
4. **Add FedProx:** only if your 3–5 simulated banks have meaningfully different data distributions (they should, if you partitioned correctly in step 1 above).
5. **Add DP-SGD:** clip + noise gradients, track privacy budget. Expect accuracy to drop — that trade-off curve is a real result for your report, not a failure.
6. **Add SHAP/LIME:** explanation generation for flagged transactions.
7. **Dashboard:** Flask/FastAPI + simple frontend showing alerts, metrics over rounds, explanations.
8. **Evaluation:** run full metrics (accuracy/precision/recall/F1/AUC-ROC + privacy budget) and write up the comparison against your Step 1 baseline.

## 4. Suggested timeline (assuming a typical ~14-week academic project window — adjust to your actual deadline)

| Weeks | Focus |
|---|---|
| 1–2 | Finalize dataset + partitioning strategy, environment setup, literature review cleanup |
| 3–4 | Baseline centralized model (Step 1 above) |
| 5–6 | Single-node preprocessing pipeline + FLARE Simulator with plain FedAvg (Steps 2–3) |
| 7 | FedProx if needed (Step 4) |
| 8–9 | DP-SGD integration + privacy budget tracking (Step 5) |
| 10 | SHAP/LIME integration (Step 6) |
| 11–12 | Dashboard + API (Step 7) |
| 13 | Full evaluation, generate final metrics and plots (Step 8) |
| 14 | Report writing, diagrams (DFD, project flow), presentation prep |

## 5. Team roles (if not solo)

- **ML/Federated lead:** Steps 1–5 (baseline through DP-SGD).
- **Explainability + backend lead:** Steps 6–7 (SHAP/LIME, API).
- **Frontend/dashboard + docs lead:** dashboard UI, report writing, diagrams.

Adjust based on actual team size — with 2 people, merge the last two roles.

## 6. Testing & evaluation plan

- Per-bank local test set **and** a held-out global test set (never used in any bank's training) — report both, since local-only numbers can look better than the model actually is.
- Track metrics **per federated round**, not just at the end — you want a convergence curve for the report, not a single number.
- Report the privacy/utility trade-off explicitly: accuracy at ε=∞ (no DP) vs. at your chosen target ε.
- Spot-check SHAP explanations manually on 5–10 true-positive fraud cases per bank — confirm the top features actually make domain sense (e.g., transaction amount/frequency spikes), not just that the code runs.

## 7. Risks & mitigations

| Risk | Mitigation |
|---|---|
| FLARE has a learning curve | Start with the Simulator, use FLARE's official examples repo as a template rather than building from scratch |
| DP-SGD tanks accuracy | Budget time to tune clip norm/noise multiplier; report the trade-off curve rather than chasing one "good enough" number |
| Non-IID partitioning makes convergence unstable | Have FedProx ready as a fallback; reduce number of local epochs per round if divergence occurs |
| Running out of time for the dashboard | It's the lowest-priority module for the core research result — descope to a simple Flask page with a metrics table if time is tight |
