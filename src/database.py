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
        explanation_text = tx.get("flag_reason") or "This domestic transaction was placed on protective security hold because a late-night ATM cash withdrawal of ₹25,000.00 heavily deviated from your normal domestic account behavior based on federated local edge inference."
        cursor.execute("""
            INSERT INTO alerts (alert_id, transaction_id, user_phone, bank_id, bank_name, risk_score, status, explanation_text, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (alert_id, tx["id"], tx["user_phone"], "bank_1", "Nagaland Regional Bank", 0.9420, "blocked", explanation_text, tx["timestamp"]))

    conn.commit()
    conn.close()
    
    # Ensure demo accounts exist with realistic domestic transactions
    seed_demo_accounts()

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
    
    # Requirement: Remove/comment out seed_user_transactions so every newly created
    # user account starts completely clean with zero transactions.
    # seed_user_transactions(clean_phone, name)
    
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

def seed_demo_accounts():
    """Seeds dedicated demo user accounts with realistic transaction data."""
    conn = get_connection()
    cursor = conn.cursor()
    
    demo_users = [
        ("9999999999", "Demo Account", "1234"),
        ("9876543210", "Saiteja Pasula (Demo)", "1234"),
        ("9988776655", "Rajesh Sharma", "4321"),
        ("9874561230", "User 1230", "4444")
    ]
    
    for phone, name, pin in demo_users:
        cursor.execute("SELECT * FROM users WHERE phone = ?", (phone,))
        if not cursor.fetchone():
            cursor.execute("""
                INSERT INTO users (phone, name, bank_id, bank_name, pin_hash, role)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (phone, name, 'bank_1', 'Nagaland Regional Bank', hash_pin(pin), 'client'))
        
        cursor.execute("SELECT COUNT(*) as count FROM transactions WHERE user_phone = ?", (phone,))
        if cursor.fetchone()["count"] == 0:
            seed_user_transactions(phone, name, conn=conn)
            
    conn.commit()
    conn.close()

def seed_user_transactions(phone: str, name: str, conn=None):
    """
    Creates realistic transaction data for demo accounts based on Bank_Transaction_Fraud_Detection.csv.
    For User 1230 (9874561230):
    - Multi-state transactions adapted to Nagaland Regional Bank.
    - Exactly two fraud transactions (Mizoram ATM withdrawal and Himachal Pradesh POS charge).
    - Four legitimate transactions (Nagaland salary, Nagaland utility bill, Assam mart, Meghalaya apparel).
    """
    close_conn = False
    if conn is None:
        conn = get_connection()
        close_conn = True
    cursor = conn.cursor()
    
    # Check if already seeded
    cursor.execute("SELECT COUNT(*) as count FROM transactions WHERE user_phone = ?", (phone,))
    if cursor.fetchone()["count"] > 0:
        if close_conn:
            conn.close()
        return

    if phone == "9874561230":
        sample_txs = [
            # 1. Fraud 1 (ATM Cash Withdrawal in Kolasib, Mizoram - Row 197115 in Bank_Transaction_Fraud_Detection.csv)
            {
                "id": "TXN-AFEE16",
                "user_phone": phone,
                "entity": "ATM Cash Withdrawal — Kolasib Kiosk",
                "subtext": "Suspicious Off-Hours ATM Withdrawal — Mizoram Node",
                "channel": "Domestic ATM Debit",
                "channel_type": "Domestic ATM Cash Withdrawal",
                "amount": 95246.76,
                "is_positive": 0,
                "status": "Flagged",
                "category": "flagged",
                "flag_reason": "High anomaly score detected by Federated Edge AI Model (Cross-State Anomaly: Off-Hours ATM Cash Withdrawal in Kolasib, Mizoram)",
                "timestamp": "Today, 11:17 PM",
                "alert": {
                    "alert_id": "ALT-AFEE16",
                    "risk_score": 0.9650,
                    "status": "blocked",
                    "explanation_text": "This cross-state transaction was placed on protective security hold because a late-night ATM cash withdrawal of ₹95,246.76 in Kolasib, Mizoram heavily deviated from your normal Nagaland account activity based on federated local edge inference (Extreme Amount Spike & Cross-State Geolocation Mismatch)."
                }
            },
            # 2. Fraud 2 (High-Value Retail POS Transfer in Manali, Himachal Pradesh - Row 29950 in Bank_Transaction_Fraud_Detection.csv)
            {
                "id": "TXN-79739E",
                "user_phone": phone,
                "entity": "Manali Luxury Merchant Clearing",
                "subtext": "Unrecognized POS Payment — Manali, Himachal Pradesh",
                "channel": "POS Debit Terminal",
                "channel_type": "Retail POS Terminal",
                "amount": 95869.68,
                "is_positive": 0,
                "status": "Flagged",
                "category": "flagged",
                "flag_reason": "High anomaly score detected by Federated Edge AI Model (Severe Geolocation Anomaly: Out-of-State POS Transfer in Himachal Pradesh)",
                "timestamp": "Today, 06:34 AM",
                "alert": {
                    "alert_id": "ALT-79739E",
                    "risk_score": 0.9520,
                    "status": "blocked",
                    "explanation_text": "This cross-state transaction was placed on protective security hold because an unverified POS charge of ₹95,869.68 in Manali, Himachal Pradesh heavily deviated from your typical Nagaland spending profile based on on-premise federated AI (Suspicious High-Value Retail Spike & Rapid Multi-State Velocity)."
                }
            },
            # 3. Legitimate (Home state - Nagaland Salary Deposit - Row 68528 in Bank_Transaction_Fraud_Detection.csv)
            {
                "id": "TXN-563900",
                "user_phone": phone,
                "entity": "Kohima Tech Enterprises NEFT",
                "subtext": "Direct Bank Salary Credit — Kohima Branch",
                "channel": "NEFT Transfer",
                "channel_type": "Direct Bank Credit",
                "amount": 45395.28,
                "is_positive": 1,
                "status": "Completed",
                "category": "income",
                "flag_reason": None,
                "timestamp": "Yesterday, 11:56 AM"
            },
            # 4. Legitimate (Home state - Nagaland Utility Payment - Row 151090 in Bank_Transaction_Fraud_Detection.csv)
            {
                "id": "TXN-21ECA3",
                "user_phone": phone,
                "entity": "Nagaland State Power & Utilities",
                "subtext": "Electricity & Utility Bill Payment — Wokha Branch",
                "channel": "Mobile Banking / IMPS",
                "channel_type": "Utility Bill Payment",
                "amount": 20972.07,
                "is_positive": 0,
                "status": "Completed",
                "category": "bills",
                "flag_reason": None,
                "timestamp": "Yesterday, 10:09 PM"
            },
            # 5. Legitimate (Neighboring state - Assam Retail Mart - Row 46226 in Bank_Transaction_Fraud_Detection.csv)
            {
                "id": "TXN-719E7A",
                "user_phone": phone,
                "entity": "Brahmaputra Mart Dibrugarh",
                "subtext": "Regional Retail Superstore — Dibrugarh, Assam",
                "channel": "UPI / POS Debit",
                "channel_type": "Retail POS Terminal",
                "amount": 24674.35,
                "is_positive": 0,
                "status": "Completed",
                "category": "shopping",
                "flag_reason": None,
                "timestamp": "2 days ago, 03:23 PM"
            },
            # 6. Legitimate (Neighboring state - Meghalaya Handicrafts - Row 192975 in Bank_Transaction_Fraud_Detection.csv)
            {
                "id": "TXN-46F243",
                "user_phone": phone,
                "entity": "Pinecone Apparel & Crafts Jowai",
                "subtext": "Handicrafts & Clothing POS — Jowai, Meghalaya",
                "channel": "UPI / Debit Card",
                "channel_type": "Retail Store Payment",
                "amount": 8020.06,
                "is_positive": 0,
                "status": "Completed",
                "category": "shopping",
                "flag_reason": None,
                "timestamp": "3 days ago, 09:08 PM"
            }
        ]
    else:
        sample_txs = [
            {
                "id": f"TXN-{uuid.uuid4().hex[:6].upper()}",
                "user_phone": phone,
                "entity": "TechCorp India Payroll",
                "subtext": "Employer NEFT Salary Deposit",
                "channel": "NEFT Transfer",
                "channel_type": "Direct Bank Credit",
                "amount": 45000.0,
                "is_positive": 1,
                "status": "Completed",
                "category": "income",
                "flag_reason": None,
                "timestamp": "Yesterday, 10:00 AM"
            },
            {
                "id": f"TXN-{uuid.uuid4().hex[:6].upper()}",
                "user_phone": phone,
                "entity": "Local Supermarket Store",
                "subtext": "Supermarket UPI / POS Payment",
                "channel": "UPI / POS Debit",
                "channel_type": "Retail POS Terminal",
                "amount": 1250.0,
                "is_positive": 0,
                "status": "Completed",
                "category": "shopping",
                "flag_reason": None,
                "timestamp": "Today, 08:15 AM"
            },
            {
                "id": f"TXN-{uuid.uuid4().hex[:6].upper()}",
                "user_phone": phone,
                "entity": "Late-Night ATM Cash Withdrawal",
                "subtext": "Suspicious Off-Hours ATM Withdrawal — Terminal #0842",
                "channel": "Domestic ATM Debit",
                "channel_type": "Domestic ATM Cash Withdrawal",
                "amount": 25000.0,
                "is_positive": 0,
                "status": "Flagged",
                "category": "flagged",
                "flag_reason": "High anomaly score detected by Federated Edge AI Model (Domestic Anomaly: Suspicious Off-Hours ATM Pattern / Possible Skimmer)",
                "timestamp": "Today, 02:41 AM"
            }
        ]

    for tx in sample_txs:
        cursor.execute("""
            INSERT INTO transactions (id, user_phone, entity, subtext, channel, channel_type, amount, is_positive, status, category, flag_reason, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (tx["id"], tx["user_phone"], tx["entity"], tx["subtext"], tx["channel"], tx["channel_type"], tx["amount"], tx["is_positive"], tx["status"], tx["category"], tx["flag_reason"], tx["timestamp"]))
        
        # If transaction is flagged, automatically seed a corresponding alert
        if tx["status"] == "Flagged":
            alert_id = tx.get("alert", {}).get("alert_id") or f"ALT-{uuid.uuid4().hex[:6].upper()}"
            risk_score = tx.get("alert", {}).get("risk_score") or 0.9420
            explanation_text = tx.get("alert", {}).get("explanation_text") or tx.get("flag_reason") or "Flagged by federated edge model."
            cursor.execute("""
                INSERT INTO alerts (alert_id, transaction_id, user_phone, bank_id, bank_name, risk_score, status, explanation_text, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (alert_id, tx["id"], phone, "bank_1", "Nagaland Regional Bank", risk_score, "blocked", explanation_text, tx["timestamp"]))
    
    if close_conn:
        conn.commit()
        conn.close()

def get_transactions_by_user(phone: str) -> List[Dict]:
    """
    Returns transactions for a given user.
    If no transactions exist for the user, returns an empty list []
    rather than falling back to global mock transactions.
    """
    clean_phone = phone.replace("-", "").replace(" ", "")
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT * FROM transactions WHERE user_phone = ? ORDER BY rowid DESC
    """, (clean_phone,))
    rows = cursor.fetchall()
    conn.close()
    
    if not rows:
        return []
    
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
