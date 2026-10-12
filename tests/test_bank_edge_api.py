from fastapi.testclient import TestClient
import sys
import os

# Ensure the app can import its modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'src')))
os.environ["BANK_ID"] = "bank_1"

from api.bank_edge_api import app

client = TestClient(app)

def test_health():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["bank_id"] == "bank_1"
    assert "global_weights_loaded" in data

def test_model_info():
    response = client.get("/model-info")
    assert response.status_code == 200
    data = response.json()
    if "error" not in data:
        assert data["bank_id"] == "bank_1"
        assert "weights_file" in data

def test_predict_safe_transaction():
    payload = {
        "age": 25,
        "transaction_amount": 10.0,
        "account_balance": 1000.0,
        "gender": "Male",
        "account_type": "Savings",
        "transaction_type": "Payment",
        "merchant_category": "Restaurant",
        "device_type": "Mobile",
        "state": "Nagaland"
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    assert data["transaction_id"] is not None
    assert data["inference_mode"] == "edge_local"
    assert data["data_left_bank"] is False
    assert "risk_score" in data
    assert "explanation" in data
    
    explanation = data["explanation"]
    assert "top_fraud_indicators" in explanation
    assert "top_safe_indicators" in explanation

def test_predict_fraud_transaction():
    # Using the known fraud transaction features we found earlier
    payload = {
        "age": 70,
        "transaction_amount": 75817.95,
        "account_balance": 44038.2,
        "gender": "Female",
        "account_type": "Business",
        "transaction_type": "Withdrawal",
        "merchant_category": "Electronics",
        "device_type": "ATM",
        "state": "Nagaland"
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    assert data["inference_mode"] == "edge_local"
    assert "risk_score" in data
    
    assert "explanation" in data
    explanation = data["explanation"]
    assert "top_fraud_indicators" in explanation

    # Check if the alert is added (only if it was actually flagged as fraud)
    alerts_response = client.get("/alerts")
    assert alerts_response.status_code == 200
    alerts = alerts_response.json()
    assert isinstance(alerts, list)
    if data["is_fraud"]:
        assert any(a["transaction_id"] == data["transaction_id"] for a in alerts)
