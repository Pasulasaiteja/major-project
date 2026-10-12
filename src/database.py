"""
database.py — SQLite Enterprise Database Layer for Federated Sentinel
====================================================================
Provides persistent storage for:
1. User Registrations & Auth (Hashed PINs)
2. User Transaction History
3. Fraud Alerts & Explanations
"""

import os
import sqlite3
import hashlib
import datetime
import uuid
from typing import List, Dict, Optional

# Path setup
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
DB_PATH = os.path.join(DATA_DIR, "sentinel_db.sqlite")

def get_connection():
    os.makedirs(DATA_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def hash_pin(pin: str) -> str:
    """Hash PIN using SHA-256 for secure storage."""
    return hashlib.sha256(pin.encode('utf-8')).hexdigest()

def init_db():
    """Create database tables if they do not exist."""
    conn = get_connection()
    cursor = conn.cursor()
    
    # Users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            phone TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            bank_id TEXT NOT NULL DEFAULT 'bank_1',
            bank_name TEXT NOT NULL DEFAULT 'Nagaland Regional Bank',
            pin_hash TEXT NOT NULL,
            role TEXT DEFAULT 'client',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Transactions table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            id TEXT PRIMARY KEY,
            user_phone TEXT NOT NULL,
            entity TEXT NOT NULL,
            subtext TEXT,
            channel TEXT NOT NULL,
            channel_type TEXT,
            amount REAL NOT NULL,
            is_positive INTEGER DEFAULT 0,
            status TEXT NOT NULL,
            category TEXT NOT NULL,
            flag_reason TEXT,
            timestamp TEXT NOT NULL,
            FOREIGN KEY (user_phone) REFERENCES users(phone)
        )
    """)
    
    # Alerts table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS alerts (
            alert_id TEXT PRIMARY KEY,
            transaction_id TEXT NOT NULL,
            user_phone TEXT NOT NULL,
            bank_id TEXT NOT NULL,
            bank_name TEXT NOT NULL,
            risk_score REAL NOT NULL,
            status TEXT DEFAULT 'blocked',
            explanation_text TEXT,
            explanation_json TEXT,
            timestamp TEXT NOT NULL
        )
    """)
    
    # Auto-sync any existing flagged transactions into alerts table if missing
    cursor.execute("""
        SELECT * FROM transactions WHERE status = 'Flagged' AND id NOT IN (SELECT transaction_id FROM alerts)
    """)
    flagged_txs = cursor.fetchall()
    for tx in flagged_txs:
        alert_id = f"ALT-{uuid.uuid4().hex[:6].upper()}"
        explanation_text = "This transaction was placed on protective hold because an incoming overseas wire transfer of this magnitude heavily deviated from typical account behavior based on federated local inference."
        cursor.execute("""
            INSERT INTO alerts (alert_id, transaction_id, user_phone, bank_id, bank_name, risk_score, status, explanation_text, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (alert_id, tx["id"], tx["user_phone"], "bank_1", "Nagaland Regional Bank", 0.9420, "blocked", explanation_text, tx["timestamp"]))

    conn.commit()
    conn.close()

# ─────────────────────────────────────────
# User Operations
# ─────────────────────────────────────────

def register_user(phone: str, name: str, pin: str, bank_id: str = "bank_1", bank_name: str = "Nagaland Regional Bank") -> Dict:
    clean_phone = phone.replace("-", "").replace(" ", "")
    conn = get_connection()
    cursor = conn.cursor()
    
    # Check if user exists
    cursor.execute("SELECT * FROM users WHERE phone = ?", (clean_phone,))
    existing = cursor.fetchone()
    if existing:
        conn.close()
        raise ValueError("Phone number already registered. Please login.")
    
    pin_h = hash_pin(pin)
    cursor.execute("""
        INSERT INTO users (phone, name, bank_id, bank_name, pin_hash, role)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (clean_phone, name, bank_id, bank_name, pin_h, 'client'))
    
    conn.commit()
    conn.close()
    
    # Seed initial transactions for new user
    seed_user_transactions(clean_phone, name)
    
    return {
        "phone": clean_phone,
        "account_number": clean_phone,
        "name": name,
        "bank_id": bank_id,
        "bank_name": bank_name,
        "role": "client",
        "token": f"tok_client_{clean_phone}"
    }

def authenticate_user(phone: str, pin: str) -> Optional[Dict]:
    clean_phone = phone.replace("-", "").replace(" ", "")
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM users WHERE phone = ?", (clean_phone,))
    user = cursor.fetchone()
    conn.close()
    
    if not user:
        return None
    
    if user["pin_hash"] == hash_pin(pin):
        return {
            "phone": user["phone"],
            "account_number": user["phone"],
            "name": user["name"],
            "bank_id": user["bank_id"],
            "bank_name": user["bank_name"],
            "role": user["role"],
            "token": f"tok_client_{user['phone']}"
        }
    return None

def get_user_by_phone(phone: str) -> Optional[Dict]:
    clean_phone = phone.replace("-", "").replace(" ", "")
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT phone, name, bank_id, bank_name, role FROM users WHERE phone = ?", (clean_phone,))
    user = cursor.fetchone()
    conn.close()
    return dict(user) if user else None

# ─────────────────────────────────────────
# Transaction Operations
# ─────────────────────────────────────────

def seed_user_transactions(phone: str, name: str):
    """Create default initial transaction history for newly registered accounts."""
    conn = get_connection()
    cursor = conn.cursor()
    
    # Check if already seeded
    cursor.execute("SELECT COUNT(*) as count FROM transactions WHERE user_phone = ?", (phone,))
    if cursor.fetchone()["count"] > 0:
        conn.close()
        return

    sample_txs = [
        {
            "id": f"TXN-{uuid.uuid4().hex[:6].upper()}",
            "user_phone": phone,
            "entity": "Salary Deposit",
            "subtext": "TechCorp India Pvt Ltd",
            "channel": "NEFT Transfer",
            "channel_type": "Direct Deposit",
            "amount": 75000.0,
            "is_positive": 1,
            "status": "Completed",
            "category": "income",
            "flag_reason": None,
            "timestamp": "Yesterday, 10:00 AM"
        },
        {
            "id": f"TXN-{uuid.uuid4().hex[:6].upper()}",
            "user_phone": phone,
            "entity": "Reliance Retail Store",
            "subtext": "Point of Sale Payment",
            "channel": "Debit Card POS",
            "channel_type": "POS Terminal",
            "amount": 3450.0,
            "is_positive": 0,
            "status": "Completed",
            "category": "shopping",
            "flag_reason": None,
            "timestamp": "Today, 08:15 AM"
        },
        {
            "id": f"TXN-{uuid.uuid4().hex[:6].upper()}",
            "user_phone": phone,
            "entity": "Nexus International Wire",
            "subtext": "High Risk Overseas Transfer",
            "channel": "Inbound Wire",
            "channel_type": "Net Banking Outbound / Wire",
            "amount": 148500.0,
            "is_positive": 0,
            "status": "Flagged",
            "category": "flagged",
            "flag_reason": "High anomaly score detected by Federated Edge AI Model",
            "timestamp": "Today, 09:41 AM"
        }
    ]

    for tx in sample_txs:
        cursor.execute("""
            INSERT INTO transactions (id, user_phone, entity, subtext, channel, channel_type, amount, is_positive, status, category, flag_reason, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (tx["id"], tx["user_phone"], tx["entity"], tx["subtext"], tx["channel"], tx["channel_type"], tx["amount"], tx["is_positive"], tx["status"], tx["category"], tx["flag_reason"], tx["timestamp"]))
        
        # If transaction is flagged, automatically seed a corresponding alert
        if tx["status"] == "Flagged":
            alert_id = f"ALT-{uuid.uuid4().hex[:6].upper()}"
            explanation_text = "This transaction was placed on protective hold because an incoming overseas wire transfer of this magnitude heavily deviates from typical account behavior based on federated local inference."
            cursor.execute("""
                INSERT INTO alerts (alert_id, transaction_id, user_phone, bank_id, bank_name, risk_score, status, explanation_text, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (alert_id, tx["id"], phone, "bank_1", "Nagaland Regional Bank", 0.9420, "blocked", explanation_text, tx["timestamp"]))
    
    conn.commit()
    conn.close()

def get_transactions_by_user(phone: str) -> List[Dict]:
    clean_phone = phone.replace("-", "").replace(" ", "")
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT * FROM transactions WHERE user_phone = ? ORDER BY rowid DESC
    """, (clean_phone,))
    rows = cursor.fetchall()
    conn.close()
    
    results = []
    for r in rows:
        results.append({
            "id": r["id"],
            "user_phone": r["user_phone"],
            "entity": r["entity"],
            "subtext": r["subtext"],
            "channel": r["channel"],
            "channelType": r["channel_type"],
            "amount": f"+₹{r['amount']:,.2f}" if r["is_positive"] else f"-₹{r['amount']:,.2f}",
            "raw_amount": r["amount"],
            "isPositive": bool(r["is_positive"]),
            "status": r["status"],
            "category": r["category"],
            "flagReason": r["flag_reason"],
            "timestamp": r["timestamp"]
        })
    return results

def add_transaction(tx_data: Dict) -> Dict:
    conn = get_connection()
    cursor = conn.cursor()
    
    tx_id = tx_data.get("id") or f"TXN-{uuid.uuid4().hex[:6].upper()}"
    user_phone = tx_data["user_phone"].replace("-", "").replace(" ", "")
    
    cursor.execute("""
        INSERT INTO transactions (id, user_phone, entity, subtext, channel, channel_type, amount, is_positive, status, category, flag_reason, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        tx_id,
        user_phone,
        tx_data["entity"],
        tx_data.get("subtext", ""),
        tx_data["channel"],
        tx_data.get("channel_type", ""),
        tx_data["amount"],
        1 if tx_data.get("is_positive") else 0,
        tx_data["status"],
        tx_data["category"],
        tx_data.get("flag_reason"),
        tx_data.get("timestamp", datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    ))
    
    conn.commit()
    conn.close()
    tx_data["id"] = tx_id
    return tx_data

# ─────────────────────────────────────────
# Alert Operations
# ─────────────────────────────────────────

def create_alert(alert_data: Dict) -> Dict:
    conn = get_connection()
    cursor = conn.cursor()
    
    alert_id = alert_data.get("alert_id") or f"ALT-{uuid.uuid4().hex[:6].upper()}"
    user_phone = alert_data.get("user_phone", "").replace("-", "").replace(" ", "")
    
    cursor.execute("""
        INSERT INTO alerts (alert_id, transaction_id, user_phone, bank_id, bank_name, risk_score, status, explanation_text, explanation_json, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        alert_id,
        alert_data["transaction_id"],
        user_phone,
        alert_data.get("bank_id", "bank_1"),
        alert_data.get("bank_name", "Nagaland Regional Bank"),
        alert_data.get("risk_score", 0.90),
        alert_data.get("status", "blocked"),
        alert_data.get("explanation_text", "Suspicious pattern flagged by AI model."),
        alert_data.get("explanation_json", "{}"),
        alert_data.get("timestamp", datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    ))
    conn.commit()
    conn.close()
    alert_data["alert_id"] = alert_id
    return alert_data

def get_alerts_by_user(phone: Optional[str] = None, status: Optional[str] = None) -> List[Dict]:
    conn = get_connection()
    cursor = conn.cursor()
    
    query = "SELECT * FROM alerts WHERE 1=1"
    params = []
    
    if phone:
        clean_phone = phone.replace("-", "").replace(" ", "")
        query += " AND user_phone = ?"
        params.append(clean_phone)
    if status:
        query += " AND status = ?"
        params.append(status)
        
    query += " ORDER BY rowid DESC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    
    results = []
    for r in rows:
        results.append({
            "alert_id": r["alert_id"],
            "transaction_id": r["transaction_id"],
            "user_phone": r["user_phone"],
            "bank_id": r["bank_id"],
            "bank_name": r["bank_name"],
            "risk_score": r["risk_score"],
            "status": r["status"],
            "explanation_text": r["explanation_text"],
            "explanation_json": r["explanation_json"],
            "timestamp": r["timestamp"]
        })
    return results

def resolve_alert(transaction_id: str) -> bool:
    """Lift hold on transaction and mark alert resolved."""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        UPDATE alerts SET status = 'resolved' WHERE transaction_id = ?
    """, (transaction_id,))
    
    cursor.execute("""
        UPDATE transactions SET status = 'Completed', flag_reason = NULL WHERE id = ?
    """, (transaction_id,))
    
    conn.commit()
    changed = cursor.rowcount > 0
    conn.close()
    return changed

# Initialize DB on load
init_db()
