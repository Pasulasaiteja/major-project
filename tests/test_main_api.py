from fastapi.testclient import TestClient
import sys
import os

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'src')))

from src.api.main import app

client = TestClient(app)

def test_central_health():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "Federated Fraud Detection System" in data["system"]

def test_central_predict():
    payload = {
        "age": 28,
        "transaction_amount": 150.0,
        "account_balance": 4500.0,
        "gender": "Female",
        "account_type": "Savings",
        "transaction_type": "Payment",
        "merchant_category": "Restaurant",
        "device_type": "Mobile",
        "state": "Nagaland",
        "bank_id": "bank_1"
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "risk_score" in data
    assert "top_fraud_features" in data
    assert "top_safe_features" in data
    assert "transaction_id" in data

def test_central_summary():
    response = client.get("/summary")
    assert response.status_code == 200
    data = response.json()
    assert "active_nodes" in data
    assert "total_transactions" in data
