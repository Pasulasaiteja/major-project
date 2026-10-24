from fastapi.testclient import TestClient
import sys
import os

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
sys.path.insert(0, os.path.join(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')), 'src'))
os.environ["BANK_ID"] = "bank_1"

from src.api.bank_edge_api import app

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


def test_manager_login_success():
    resp = client.post("/manager/login", json={"manager_id": "MGR-NRB-001", "pin": "112233"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["token"] == "tok_manager_bank_1"
    assert data["manager"]["name"] == "Anurag Kapoor"
    assert data["manager"]["bank_id"] == "bank_1"


def test_manager_login_invalid():
    resp = client.post("/manager/login", json={"manager_id": "MGR-NRB-001", "pin": "999999"})
    assert resp.status_code == 401
    assert "Invalid Manager ID or PIN" in resp.json()["detail"]


def test_manager_fraud_alerts():
    headers = {"X-Manager-Token": "tok_manager_bank_1"}
    resp = client.get("/manager/fraud-alerts", headers=headers)
    assert resp.status_code == 200
    alerts = resp.json()
    assert isinstance(alerts, list)
    assert len(alerts) > 0
    assert alerts[0]["bank_id"] == "bank_1"


def test_manager_tickets_lifecycle():
    headers = {"X-Manager-Token": "tok_manager_bank_1"}

    # 1. Sync a test ticket
    tkt_id = f"TKT-TEST-{os.urandom(3).hex().upper()}"
    tx_id = f"TXN-TEST-{os.urandom(3).hex().upper()}"
    sync_resp = client.post("/manager/tickets/sync", json={
        "ticket_id": tkt_id,
        "user_phone": "9988776655",
        "user_name": "Rajesh Sharma",
        "bank_id": "bank_1",
        "bank_name": "Nagaland Regional Bank",
        "tx_id": tx_id,
        "reason": "skimmer_cloned_card",
        "reason_label": "Suspected card skimming",
        "comments": "Card skimmed at ATM terminal #0842",
        "urgency": "high",
        "status": "open",
        "status_label": "Under Review",
        "created_at": "2026-10-24T10:00:00",
        "updated_at": "2026-10-24T10:00:00",
        "timeline_json": "[]"
    })
    assert sync_resp.status_code == 200
    assert sync_resp.json()["success"] is True

    # 2. Fetch tickets
    get_resp = client.get("/manager/tickets", headers=headers)
    assert get_resp.status_code == 200
    tickets = get_resp.json()
    matching = [t for t in tickets if t["ticket_id"] == tkt_id]
    assert len(matching) == 1
    assert matching[0]["status"] == "open"

    # 3. Update status to branch_visit
    patch_resp = client.patch(f"/manager/tickets/{tkt_id}/status", headers=headers, json={
        "new_status": "branch_visit",
        "manager_note": "Please visit Dimapur main branch with Aadhaar Card.",
        "timeline_event": "Branch Visit Scheduled",
        "timeline_note": "Manager requested in-person verification."
    })
    assert patch_resp.status_code == 200
    assert patch_resp.json()["new_status"] == "branch_visit"

    # 4. Resolve ticket
    res_resp = client.patch(f"/manager/tickets/{tkt_id}/status", headers=headers, json={
        "new_status": "resolved",
        "manager_note": "Identity verified in branch. Account unfrozen.",
        "timeline_event": "Investigation Complete",
        "timeline_note": "Account access fully restored."
    })
    assert res_resp.status_code == 200
    assert res_resp.json()["new_status"] == "resolved"

