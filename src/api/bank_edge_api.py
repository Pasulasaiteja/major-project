"""
bank_edge_api.py  ──  Flow B: Edge Inference
============================================================
This FastAPI app is designed to run LOCALLY inside each bank node.

How it works:
  1. The central server completes FedAvg (5 rounds) and saves global_weights.pth.
  2. This file (global_weights.pth) is pushed / copied to each bank's machine.
  3. Each bank starts THIS app on their own server (e.g. port 8001 / 8002 / 8003).
  4. New transactions are sent to the LOCAL bank API — never to the central server.
  5. The bank's copy of the global model classifies the transaction on-premise.

Run for Bank 1:
    BANK_ID=bank_1 BANK_PORT=8001 python -m uvicorn src.api.bank_edge_api:app --host 127.0.0.1 --port 8001 --reload

Run for Bank 2:
    BANK_ID=bank_2 BANK_PORT=8002 python -m uvicorn src.api.bank_edge_api:app --host 127.0.0.1 --port 8002 --reload

Run for Bank 3:
    BANK_ID=bank_3 BANK_PORT=8003 python -m uvicorn src.api.bank_edge_api:app --host 127.0.0.1 --port 8003 --reload
"""

import os
import sys
import json
import uuid
import datetime
import numpy as np
import torch
import pandas as pd
import shap
from typing import Optional, List, Dict
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer

# ── Path setup ──────────────────────────────────────────────────────────────
SRC_DIR = os.path.dirname(os.path.dirname(__file__))
BASE_DIR = os.path.dirname(SRC_DIR)
sys.path.insert(0, SRC_DIR)
sys.path.insert(0, os.path.join(SRC_DIR, "ml_pipeline"))
from mock_federated_avg import FraudDNN
import database

# ── Bank identity (override with env vars when starting each bank) ────────────
BANK_ID   = os.environ.get("BANK_ID", "bank_1")
BANK_PORT = int(os.environ.get("BANK_PORT", 8001))

BANK_INFO = {
    "bank_1": {"name": "Nagaland Regional Bank",    "state": "Nagaland",      "file": "bank_1_Nagaland.csv"},
    "bank_2": {"name": "Meghalaya Regional Bank",   "state": "Meghalaya",     "file": "bank_2_Meghalaya.csv"},
    "bank_3": {"name": "UP Gramin Bank",            "state": "Uttar Pradesh", "file": "bank_3_Uttar Pradesh.csv"},
}

MODELS_DIR     = os.path.join(BASE_DIR, "models")
WEIGHTS_PATH   = os.path.join(MODELS_DIR, "global_weights.pth")
META_PATH      = os.path.join(MODELS_DIR, "model_meta.json")
PARTITIONED_DIR = os.path.join(BASE_DIR, "data", "partitioned_banks")

# ── In-memory local alert log ─────────────────────────────────────────────────
LOCAL_ALERTS = []

# ── App init ──────────────────────────────────────────────────────────────────
bank_name = BANK_INFO.get(BANK_ID, {}).get("name", BANK_ID)

app = FastAPI(
    title=f"Edge Inference API — {bank_name}",
    description=(
        "Flow B: Local fraud inference node. "
        "Transactions are never sent to the central server. "
        "The global model weights are loaded locally."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Lazy model loader ─────────────────────────────────────────────────────────
_model = None
_preprocessor = None
_feature_names = None
_input_dim = None
_background_tensor = None

def get_edge_model():
    """Load the global weights into the local model. Called once on first request."""
    global _model, _preprocessor, _feature_names, _input_dim, _background_tensor

    if _model is not None:
        return _model, _preprocessor, _feature_names, _background_tensor

    # Read model architecture metadata
    if not os.path.exists(META_PATH):
        raise RuntimeError(
            f"model_meta.json not found at {META_PATH}. "
            "Run dp_federated_avg.py first to generate global weights."
        )
    with open(META_PATH) as f:
        meta = json.load(f)
    _input_dim = meta["input_dim"]

    # Build and load weights
    if not os.path.exists(WEIGHTS_PATH):
        raise RuntimeError(
            f"global_weights.pth not found at {WEIGHTS_PATH}. "
            "Run dp_federated_avg.py first to train and save the global model."
        )
    model = FraudDNN(_input_dim)
    model.load_state_dict(torch.load(WEIGHTS_PATH, map_location="cpu"))
    model.eval()

    # Build local preprocessor from this bank's own data
    info = BANK_INFO.get(BANK_ID)
    if info is None:
        raise RuntimeError(f"Unknown BANK_ID: {BANK_ID}")

    fp = os.path.join(PARTITIONED_DIR, info["file"])
    if not os.path.exists(fp):
        raise RuntimeError(f"Bank data file not found: {fp}")

    df = pd.read_csv(fp)
    numeric_features     = ['Age', 'Transaction_Amount', 'Account_Balance']
    categorical_features = ['Gender', 'Account_Type', 'Transaction_Type',
                            'Merchant_Category', 'Device_Type', 'State']

    preprocessor = ColumnTransformer(transformers=[
        ('num', StandardScaler(), numeric_features),
        ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features),
    ])
    preprocessor.fit(df[numeric_features + categorical_features])

    cat_names = preprocessor.named_transformers_['cat'].get_feature_names_out(categorical_features)
    feature_names = numeric_features + list(cat_names)

    X_enc = preprocessor.transform(df[numeric_features + categorical_features])
    background = torch.FloatTensor(X_enc[:50])

    _model = model
    _preprocessor = preprocessor
    _feature_names = feature_names
    _background_tensor = background
    return _model, _preprocessor, _feature_names, _background_tensor


# ── Pydantic Schemas ──────────────────────────────────────────────────────────
def generate_nlp_explanation(top_fraud):
    if not top_fraud:
        return "The system flagged this transaction, but specific risk factors were unclear."

    reasons = []
    for name, impact in list(top_fraud.items())[:3]: # Take top 3 factors
        # Map raw feature names to human-readable text
        if "Amount" in name:
            reasons.append("an unusually high transaction amount")
        elif "Device_Type" in name and "Unknown" in name:
            reasons.append("the use of an unrecognized or suspicious device")
        elif "Device_Type" in name:
            reasons.append("suspicious device characteristics")
        elif "Merchant_Category" in name:
            category = name.split('_')[-1] 
            reasons.append(f"a high-risk merchant category ({category})")
        elif "Transaction_Type" in name and "Wire" in name:
            reasons.append("an unexpected wire transfer")
        elif "Transaction_Type" in name:
            channel = name.split('_')[-1]
            reasons.append(f"an unusual transaction channel ({channel})")
        elif "State" in name:
            reasons.append("a suspicious geographical location")
        elif "Age" in name:
            reasons.append("an unusual account age correlation")
        else:
            clean_name = name.replace("_", " ").title()
            reasons.append(f"unusual activity involving {clean_name}")

    if len(reasons) == 1:
        nlp_text = f"This transaction was flagged due to {reasons[0]}."
    elif len(reasons) == 2:
        nlp_text = f"This transaction was flagged due to {reasons[0]} and {reasons[1]}."
    else:
        nlp_text = f"This transaction was flagged due to {reasons[0]}, {reasons[1]}, and {reasons[2]}."

    return nlp_text

class TransactionRequest(BaseModel):
    age: float
    transaction_amount: float
    account_balance: float
    gender: str
    account_type: str
    transaction_type: str
    merchant_category: str
    device_type: str
    # State is pre-filled from this bank's state but can be overridden
    state: str = None

class EdgePredictionResponse(BaseModel):
    transaction_id: str
    bank_id: str
    bank_name: str
    is_fraud: bool
    risk_score: float
    inference_mode: str          # always "edge_local" in Flow B
    data_left_bank: bool         # always False in Flow B
    timestamp: str
    status: str
    explanation: dict = None
    explanation_text: str = None


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
def health():
    weights_ready = os.path.exists(WEIGHTS_PATH)
    return {
        "bank_id": BANK_ID,
        "bank_name": bank_name,
        "inference_mode": "Flow B — Edge Local",
        "global_weights_loaded": weights_ready,
        "status": "online",
    }


@app.post("/predict", response_model=EdgePredictionResponse, tags=["Prediction"])
def predict_locally(tx: TransactionRequest):
    """
    Flow B: Transaction is classified ENTIRELY ON THIS BANK'S MACHINE.
    The transaction data never leaves this bank's network.
    """
    try:
        model, preprocessor, feature_names, background = get_edge_model()
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))

    # Use the bank's own state if none provided
    state_value = tx.state or BANK_INFO.get(BANK_ID, {}).get("state", "Unknown")

    row = pd.DataFrame([{
        'Age':                  tx.age,
        'Transaction_Amount':   tx.transaction_amount,
        'Account_Balance':      tx.account_balance,
        'Gender':               tx.gender,
        'Account_Type':         tx.account_type,
        'Transaction_Type':     tx.transaction_type,
        'Merchant_Category':    tx.merchant_category,
        'Device_Type':          tx.device_type,
        'State':                state_value,
    }])

    X_enc    = preprocessor.transform(row)
    x_tensor = torch.FloatTensor(X_enc)

    with torch.no_grad():
        risk_score = float(model(x_tensor).squeeze())

    is_fraud  = risk_score > 0.5
    tx_id     = str(uuid.uuid4())[:8].upper()
    ts        = datetime.datetime.now(datetime.timezone.utc).isoformat()
    status    = "blocked" if is_fraud else "cleared"

    # SHAP explanation
    explainer = shap.GradientExplainer(model, background)
    sv_raw = explainer.shap_values(x_tensor)
    sv_matrix = np.array(sv_raw[0] if isinstance(sv_raw, list) else sv_raw)
    if sv_matrix.ndim > 2:
        sv_matrix = sv_matrix.reshape(sv_matrix.shape[0], -1)
    sv_flat = sv_matrix[0].flatten()

    impacts = [(name, float(v)) for name, v in zip(feature_names, sv_flat)]
    impacts.sort(key=lambda x: x[1], reverse=True)

    top_fraud = {name: round(val, 5) for name, val in impacts if val > 0}
    top_safe  = {name: round(abs(val), 5) for name, val in impacts if val < 0}

    # Keep only top 5 each
    top_fraud = dict(list(top_fraud.items())[:5])
    top_safe  = dict(list(top_safe.items())[:5])
    
    # Generate an explainable AI summary in words
    explanation_text = "This transaction was classified as Safe."
    if is_fraud:
        explanation_text = generate_nlp_explanation(top_fraud)

    explanation = {
        "top_fraud_indicators": top_fraud,
        "top_safe_indicators": top_safe
    }

    alert = {
        "transaction_id": tx_id,
        "bank_id":        BANK_ID,
        "bank_name":      bank_name,
        "risk_score":     round(risk_score, 4),
        "timestamp":      ts,
        "status":         status,
        "inference_mode": "edge_local",
        "data_left_bank": False,
        "explanation":    explanation,
        "explanation_text": explanation_text,
    }
    if is_fraud:
        LOCAL_ALERTS.append(alert)
        TRANSACTIONS_DB.insert(0, {
            "id": tx_id,
            "entity": f"{tx.merchant_category} Merchant" if tx.merchant_category else "Simulated Fraud Transfer",
            "subtext": f"{tx.transaction_type} #{tx_id}",
            "channel": tx.transaction_type,
            "channelType": "AI Simulated Transfer",
            "amount": f"-${tx.transaction_amount:,.2f}",
            "isPositive": False,
            "status": "Flagged",
            "category": "flagged",
            "timestamp": "Just Now",
            "flagReason": "High risk score by federated model",
            "actionText": "Review Flag"
        })
        try:
            # Also store in SQLite for active user
            database.create_alert({
                "transaction_id": tx_id,
                "user_phone": "9876543210",
                "bank_id": BANK_ID,
                "bank_name": bank_name,
                "risk_score": round(risk_score, 4),
                "status": "blocked",
                "explanation_text": explanation_text,
                "timestamp": ts
            })
            database.add_transaction({
                "id": tx_id,
                "user_phone": "9876543210",
                "entity": f"{tx.merchant_category} Merchant" if tx.merchant_category else "Simulated Fraud Transfer",
                "subtext": f"{tx.transaction_type} #{tx_id}",
                "channel": tx.transaction_type,
                "channel_type": "AI Simulated Transfer",
                "amount": tx.transaction_amount,
                "is_positive": False,
                "status": "Flagged",
                "category": "flagged",
                "flag_reason": "High risk score by federated model",
                "timestamp": "Just Now"
            })
        except Exception as e:
            print("Could not persist alert to DB:", e)

    return EdgePredictionResponse(
        transaction_id  = tx_id,
        bank_id         = BANK_ID,
        bank_name       = bank_name,
        is_fraud        = is_fraud,
        risk_score      = round(risk_score, 4),
        inference_mode  = "edge_local",
        data_left_bank  = False,
        timestamp       = ts,
        status          = status,
        explanation     = explanation,
        explanation_text= explanation_text
    )


@app.get("/alerts", tags=["Alerts"])
def get_local_alerts(phone: Optional[str] = None, status: Optional[str] = None):
    """Returns fraud alerts from the SQLite database."""
    db_alerts = database.get_alerts_by_user(phone=phone, status=status)
    if db_alerts:
        return db_alerts
    # Fallback to in-memory if db has no entries yet
    return [a for a in LOCAL_ALERTS if (not status or a.get("status") == status)]


@app.patch("/alerts/{transaction_id}/resolve", tags=["Alerts"])
@app.post("/alerts/{transaction_id}/resolve", tags=["Alerts"])
def resolve_alert(transaction_id: str):
    """Lift hold on transaction and mark alert resolved."""
    # Resolve in database
    database.resolve_alert(transaction_id)
    
    # Also update in-memory objects if present
    for a in LOCAL_ALERTS:
        if a.get("transaction_id") == transaction_id:
            a["status"] = "resolved"
            
    for t in TRANSACTIONS_DB:
        if t.get("id") == transaction_id:
            t["status"] = "Completed"
            t.pop("flagReason", None)
            
    return {"success": True, "message": f"Hold lifted for {transaction_id}", "status": "resolved"}


@app.get("/model-info", tags=["Model"])
def model_info():
    """Show which global weights file this edge node has loaded."""
    if not os.path.exists(META_PATH):
        return {"error": "model_meta.json not found. Run training first."}
    with open(META_PATH) as f:
        meta = json.load(f)
    return {
        "bank_id":        BANK_ID,
        "bank_name":      bank_name,
        "weights_file":   WEIGHTS_PATH,
        "weights_exist":  os.path.exists(WEIGHTS_PATH),
        "input_dim":      meta.get("input_dim"),
        "num_rounds":     meta.get("num_rounds"),
        "dp_epsilon_total": meta.get("dp_epsilon_total"),
        "inference_mode": "Flow B — Edge Local",
    }



# ── Auth & Data Management (Added for Frontend integration) ────────────────────
class LoginRequest(BaseModel):
    account_number: str
    pin: str

class RegisterRequest(BaseModel):
    phone: str
    name: str
    pin: str

USERS_DB = {
    "pashula.saiteja": {
        "account_number": "pashula.saiteja",
        "name": "Sai Teja Pashula",
        "pin": "4444",
        "role": "client",
        "token": "tok_client_sai"
    },
    "1234567890": {
        "account_number": "1234567890",
        "name": "John Smith",
        "pin": "1234",
        "role": "client",
        "token": "tok_client_123"
    },
    "092144829012": {
        "account_number": "092144829012",
        "name": "Jane Client",
        "pin": "492111",
        "role": "client",
        "token": "tok_client_999"
    },
    "manager": {
        "account_number": "manager",
        "name": "Bank Manager",
        "pin": "000000",
        "role": "employee",
        "token": "tok_manager_111"
    }
}

# Transaction Database mimicking frontend types
TRANSACTIONS_DB = []

def init_mock_db():
    if len(TRANSACTIONS_DB) > 0: return

    # Clean normal transactions
    TRANSACTIONS_DB.append({
        "id": "TXN-82011",
        "entity": "Cash Withdrawal",
        "subtext": "Downtown Branch ATM #04",
        "channel": "Terminal Debit",
        "channelType": "ATM Cash Withdrawal",
        "amount": "-$200.00",
        "isPositive": False,
        "status": "Completed",
        "category": "withdrawals",
        "timestamp": "Today, 08:30 AM"
    })
    
    TRANSACTIONS_DB.append({
        "id": "TXN-82012",
        "entity": "Groceries UP",
        "subtext": "Supermarket Varanasi",
        "channel": "POS Debit",
        "channelType": "Card Payment",
        "amount": "-$45.50",
        "isPositive": False,
        "status": "Completed",
        "category": "shopping",
        "timestamp": "Today, 09:15 AM"
    })
    
    TRANSACTIONS_DB.append({
        "id": "TXN-82013",
        "entity": "Salary Deposit",
        "subtext": "TechCorp India Pvt Ltd",
        "channel": "NEFT Transfer",
        "channelType": "Direct Deposit",
        "amount": "+$4,500.00",
        "isPositive": True,
        "status": "Completed",
        "category": "income",
        "timestamp": "Yesterday, 10:00 AM"
    })
    
    # Let's generate a fraudulent transaction by calling predict_locally internally!
    # We will simulate a high probability fraud request.
    tx_req = TransactionRequest(
        age=22,
        transaction_amount=150000.0,
        account_balance=50.0,
        gender="Male",
        account_type="Checking",
        transaction_type="Wire",
        merchant_category="Crypto",
        device_type="Unknown",
        state="Unknown"
    )
    
    try:
        # Evaluate it
        model, preprocessor, feature_names, background = get_edge_model()
        row = pd.DataFrame([{
            'Age': tx_req.age,
            'Transaction_Amount': tx_req.transaction_amount,
            'Account_Balance': tx_req.account_balance,
            'Gender': tx_req.gender,
            'Account_Type': tx_req.account_type,
            'Transaction_Type': tx_req.transaction_type,
            'Merchant_Category': tx_req.merchant_category,
            'Device_Type': tx_req.device_type,
            'State': tx_req.state,
        }])
        X_enc = preprocessor.transform(row)
        x_tensor = torch.FloatTensor(X_enc)
        risk_score = float(model(x_tensor).squeeze())
        
        is_fraud = risk_score > 0.5
        tx_id = f"TXN-{str(uuid.uuid4())[:5].upper()}"
        ts = datetime.datetime.now(datetime.timezone.utc).isoformat()
        
        explainer = shap.GradientExplainer(model, background)
        sv_raw = explainer.shap_values(x_tensor)
        sv_matrix = np.array(sv_raw[0] if isinstance(sv_raw, list) else sv_raw)
        if sv_matrix.ndim > 2:
            sv_matrix = sv_matrix.reshape(sv_matrix.shape[0], -1)
        sv_flat = sv_matrix[0].flatten()

        impacts = [(name, float(v)) for name, v in zip(feature_names, sv_flat)]
        impacts.sort(key=lambda x: x[1], reverse=True)

        top_fraud = dict(list({name: round(val, 5) for name, val in impacts if val > 0}.items())[:5])
        top_safe  = dict(list({name: round(abs(val), 5) for name, val in impacts if val < 0}.items())[:5])
        
        explanation_text = generate_nlp_explanation(top_fraud)
        
        explanation = {
            "top_fraud_indicators": top_fraud,
            "top_safe_indicators": top_safe
        }
        
        alert = {
            "transaction_id": tx_id,
            "bank_id": BANK_ID,
            "bank_name": bank_name,
            "risk_score": round(risk_score, 4),
            "timestamp": ts,
            "status": "blocked",
            "inference_mode": "edge_local",
            "data_left_bank": False,
            "explanation": explanation,
            "explanation_text": explanation_text,
        }
        LOCAL_ALERTS.append(alert)
        
        TRANSACTIONS_DB.insert(0, {
            "id": tx_id,
            "entity": "Nexus Clearing LLC",
            "subtext": f"Incoming Wire Transfer #{tx_id}",
            "channel": "Inbound Wire",
            "channelType": "Net Banking Outbound / Wire",
            "amount": "+$14,850.00",
            "isPositive": True,
            "status": "Flagged",
            "category": "flagged",
            "timestamp": "Today, 09:41 AM EST",
            "flagReason": "High risk score by federated model",
            "actionText": "Review Flag"
        })

    except Exception as e:
        print("Could not initialize mock DB with model:", e)

@app.post("/register", tags=["Auth"])
def register(req: RegisterRequest):
    try:
        user = database.register_user(
            phone=req.phone,
            name=req.name,
            pin=req.pin,
            bank_id=BANK_ID,
            bank_name=bank_name
        )
        return {"success": True, "token": user["token"], "user": user}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/login", tags=["Auth"])
def login(req: LoginRequest):
    user = database.authenticate_user(phone=req.account_number, pin=req.pin)
    if user:
        return {"success": True, "token": user["token"], "user": user}
    raise HTTPException(status_code=401, detail="Invalid phone number or MPIN")

@app.get("/users", tags=["Auth"])
def list_users():
    conn = database.get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT phone, name, bank_id, bank_name, role FROM users ORDER BY rowid ASC")
    users = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return users

@app.get("/transactions", tags=["Data"])
def get_transactions(phone: Optional[str] = None):
    if not phone:
        # Check active phone or default
        phone = "9876543210"
    txs = database.get_transactions_by_user(phone)
    if not txs:
        init_mock_db()
        return TRANSACTIONS_DB
    return txs


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("bank_edge_api:app", host="127.0.0.1", port=BANK_PORT, reload=True)
