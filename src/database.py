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
from typing import List, Dict, Optional, Any

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

    # Managers table (Branch Operations Portal)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS managers (
            manager_id   TEXT PRIMARY KEY,
            bank_id      TEXT NOT NULL,
            bank_name    TEXT NOT NULL,
            name         TEXT NOT NULL,
            pin_hash     TEXT NOT NULL,
            created_at   TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Tickets table (Investigation Tickets synced from client)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tickets (
            ticket_id     TEXT PRIMARY KEY,
            user_phone    TEXT NOT NULL,
            user_name     TEXT,
            bank_id       TEXT NOT NULL,
            bank_name     TEXT NOT NULL,
            tx_id         TEXT,
            reason        TEXT NOT NULL,
            reason_label  TEXT,
            comments      TEXT,
            urgency       TEXT DEFAULT 'high',
            status        TEXT DEFAULT 'open',
            status_label  TEXT DEFAULT 'Under Review',
            manager_note  TEXT,
            created_at    TEXT NOT NULL,
            updated_at    TEXT NOT NULL,
            timeline_json TEXT
        )
    """)
    
    # Clean out any legacy repetitive dummy test predictions
    cursor.execute("DELETE FROM alerts WHERE transaction_id IN (SELECT id FROM transactions WHERE entity = 'Restaurant Merchant' AND amount = 10.0)")
    cursor.execute("DELETE FROM transactions WHERE entity = 'Restaurant Merchant' AND amount = 10.0")

    # Auto-sync any existing flagged transactions into alerts table if missing
    cursor.execute("""
        SELECT * FROM transactions WHERE status = 'Flagged' AND id NOT IN (SELECT transaction_id FROM alerts)
    """)
    flagged_txs = cursor.fetchall()
    for row in flagged_txs:
        tx = dict(row)
        alert_id = f"ALT-{tx['id'].replace('TXN-', '')}" if tx.get("id", "").startswith("TXN-") else f"ALT-{uuid.uuid4().hex[:6].upper()}"
        explanation_text = tx.get("flag_reason") or "Flagged by federated edge model."
        cursor.execute("""
            INSERT INTO alerts (alert_id, transaction_id, user_phone, bank_id, bank_name, risk_score, status, explanation_text, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (alert_id, tx["id"], tx["user_phone"], "bank_1", "Nagaland Regional Bank", 0.9420, "blocked", explanation_text, tx["timestamp"]))

    conn.commit()
    conn.close()
    
    # Ensure demo accounts exist with realistic domestic transactions
    seed_demo_accounts()
    # Seed default manager accounts for the branch portal
    seed_managers()

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

def seed_demo_accounts(force: bool = False):
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
        count = cursor.fetchone()["count"]
        if count == 0 or force:
            if force:
                cursor.execute("DELETE FROM alerts WHERE user_phone = ?", (phone,))
                cursor.execute("DELETE FROM transactions WHERE user_phone = ?", (phone,))
            seed_user_transactions(phone, name, conn=conn, force=force)
            
    conn.commit()
    conn.close()

def seed_user_transactions(phone: str, name: str, conn=None, force: bool = False):
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
    if not force:
        cursor.execute("SELECT COUNT(*) as count FROM transactions WHERE user_phone = ?", (phone,))
        if cursor.fetchone()["count"] > 0:
            if close_conn:
                conn.close()
            return

    if phone == "9874561230":
        sample_txs: List[Dict[str, Any]] = [
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
    elif phone == "9988776655":
        sample_txs: List[Dict[str, Any]] = [
            # 1. High-Value Inbound Wire Layering Fraud
            {
                "id": "TXN-SWIFT01",
                "user_phone": phone,
                "entity": "Global Apex Remittance Offshore Wire",
                "subtext": "Inbound SWIFT Cross-Border Clearing — Zurich Node",
                "channel": "SWIFT Wire Transfer",
                "channel_type": "International Wire Remittance",
                "amount": 185000.0,
                "is_positive": 0,
                "status": "Flagged",
                "category": "flagged",
                "flag_reason": "High anomaly score detected by Federated Edge AI Model: Cross-border high-value wire anomaly targeting an unregistered offshore beneficiary with unusual layering characteristics.",
                "timestamp": "Today, 03:12 PM",
                "alert": {
                    "alert_id": "ALT-SWIFT01",
                    "risk_score": 0.9780,
                    "status": "blocked",
                    "explanation_text": "High anomaly score detected by Federated Edge AI Model: Cross-border high-value wire anomaly of ₹1,85,000.00 targeting an unregistered offshore beneficiary with unusual layering characteristics."
                }
            },
            # 2. Late-Night Off-Hours ATM Withdrawal Fraud
            {
                "id": "TXN-EB0CCF",
                "user_phone": phone,
                "entity": "Late-Night ATM Cash Withdrawal — Dimapur Central",
                "subtext": "Suspicious Off-Hours ATM Withdrawal — Terminal #0842",
                "channel": "Domestic ATM Debit",
                "channel_type": "Domestic ATM Cash Withdrawal",
                "amount": 25000.0,
                "is_positive": 0,
                "status": "Flagged",
                "category": "flagged",
                "flag_reason": "High anomaly score detected by Federated Edge AI Model (Domestic Anomaly: Suspicious Off-Hours ATM Pattern / Possible Skimmer at 02:41 AM)",
                "timestamp": "Today, 02:41 AM",
                "alert": {
                    "alert_id": "ALT-EB0CCF",
                    "risk_score": 0.9420,
                    "status": "blocked",
                    "explanation_text": "Late-night domestic ATM cash withdrawal of ₹25,000.00 at 02:41 AM heavily deviated from normal daytime pattern based on federated edge inference."
                }
            },
            # 3. Legitimate Retainer Deposit
            {
                "id": "TXN-0D5063",
                "user_phone": phone,
                "entity": "Apex Consulting Retainer NEFT",
                "subtext": "Direct Client Professional Services Retainer — Kohima",
                "channel": "NEFT Transfer",
                "channel_type": "Direct Bank Credit",
                "amount": 85000.0,
                "is_positive": 1,
                "status": "Completed",
                "category": "income",
                "flag_reason": None,
                "alert": None,
                "timestamp": "Yesterday, 11:30 AM"
            },
            # 4. Legitimate Server Hosting Payment
            {
                "id": "TXN-80EBE5",
                "user_phone": phone,
                "entity": "Dimapur Cloud Hosting Subscription",
                "subtext": "Monthly Server Infrastructure Recurring Payment",
                "channel": "UPI / Debit Card",
                "channel_type": "Cloud Recurring Debit",
                "amount": 3499.0,
                "is_positive": 0,
                "status": "Completed",
                "category": "bills",
                "flag_reason": None,
                "alert": None,
                "timestamp": "Yesterday, 07:15 PM"
            }
        ]
    elif phone == "9876543210":
        sample_txs: List[Dict[str, Any]] = [
            # 1. Burst Velocity High-Risk Gateway Fraud
            {
                "id": "TXN-UPI092",
                "user_phone": phone,
                "entity": "FastCrypto Pay Direct Gateway Surge",
                "subtext": "Automated High-Velocity Direct Merchant Debit",
                "channel": "UPI Instant Debit",
                "channel_type": "UPI Merchant Direct API",
                "amount": 49999.0,
                "is_positive": 0,
                "status": "Flagged",
                "category": "flagged",
                "flag_reason": "Burst velocity anomaly: High-velocity UPI debit executed seconds after token creation targeting an unregulated merchant gateway, deviating from customer historical profile.",
                "timestamp": "Today, 01:15 AM",
                "alert": {
                    "alert_id": "ALT-UPI092",
                    "risk_score": 0.9310,
                    "status": "blocked",
                    "explanation_text": "Burst velocity anomaly: High-velocity UPI debit of ₹49,999.00 executed seconds after token creation targeting an unregulated merchant gateway."
                }
            },
            # 2. Physical Card Hardware Skimming Anomaly
            {
                "id": "TXN-POS882",
                "user_phone": phone,
                "entity": "Highway Fuel Station Terminal Duplicate",
                "subtext": "Physical POS Magnetic Stripe Replay Sequence",
                "channel": "POS Terminal Swipe",
                "channel_type": "Magnetic Stripe Fallback",
                "amount": 8500.0,
                "is_positive": 0,
                "status": "Flagged",
                "category": "flagged",
                "flag_reason": "Hardware skimming flag: Magnetic stripe fallback transaction executed within 3 minutes of a chip-and-PIN authorization 180 km away (Impossible Speed Velocity).",
                "timestamp": "Yesterday, 04:20 PM",
                "alert": {
                    "alert_id": "ALT-POS882",
                    "risk_score": 0.8920,
                    "status": "blocked",
                    "explanation_text": "Hardware skimming flag: Magnetic stripe fallback transaction of ₹8,500.00 executed within 3 minutes of authorization 180 km away."
                }
            },
            # 3. Legitimate Payroll Deposit
            {
                "id": "TXN-31AE64",
                "user_phone": phone,
                "entity": "TechCorp India Payroll Credit",
                "subtext": "Employer NEFT Salary Deposit — Dimapur Branch",
                "channel": "NEFT Transfer",
                "channel_type": "Direct Bank Credit",
                "amount": 45000.0,
                "is_positive": 1,
                "status": "Completed",
                "category": "income",
                "flag_reason": None,
                "alert": None,
                "timestamp": "Yesterday, 10:00 AM"
            },
            # 4. Legitimate Electronics Purchase
            {
                "id": "TXN-469FAA",
                "user_phone": phone,
                "entity": "Reliance Digital Kohima Store",
                "subtext": "Electronics & Accessories POS Purchase",
                "channel": "UPI / POS Debit",
                "channel_type": "Retail POS Terminal",
                "amount": 12499.0,
                "is_positive": 0,
                "status": "Completed",
                "category": "shopping",
                "flag_reason": None,
                "alert": None,
                "timestamp": "2 days ago, 04:30 PM"
            },
            # 5. Legitimate Cafe Payment
            {
                "id": "TXN-58210D",
                "user_phone": phone,
                "entity": "Cafe Shillong Bistro UPI",
                "subtext": "Food & Beverage QR Code Payment",
                "channel": "UPI QR Code",
                "channel_type": "Quick Merchant Payment",
                "amount": 850.0,
                "is_positive": 0,
                "status": "Completed",
                "category": "dining",
                "flag_reason": None,
                "alert": None,
                "timestamp": "3 days ago, 01:10 PM"
            }
        ]
    else:
        sample_txs: List[Dict[str, Any]] = [
            # 1. Card-Not-Present Cross-Border Luxury E-Commerce Fraud
            {
                "id": "TXN-CNP441",
                "user_phone": phone,
                "entity": "Luxury Horology Zurich CNP",
                "subtext": "Card-Not-Present Cross-Border Merchant",
                "channel": "International Online CNP",
                "channel_type": "Cross-Border E-Commerce",
                "amount": 72400.0,
                "is_positive": 0,
                "status": "Flagged",
                "category": "flagged",
                "flag_reason": "Card-Not-Present cross-border transaction of ₹72,400.00 flagged due to international merchant code without travel notification or 3DS authentication.",
                "timestamp": "Yesterday, 09:44 PM",
                "alert": {
                    "alert_id": "ALT-CNP441",
                    "risk_score": 0.9150,
                    "status": "blocked",
                    "explanation_text": "Card-Not-Present cross-border transaction of ₹72,400.00 flagged due to international merchant code without travel notification or 3DS authentication."
                }
            },
            # 2. Legitimate Salary
            {
                "id": "TXN-61F01D",
                "user_phone": phone,
                "entity": "Northeast Regional Consultancy Salary",
                "subtext": "Monthly Retainer Salary Credit — Kohima",
                "channel": "NEFT Transfer",
                "channel_type": "Direct Bank Credit",
                "amount": 55000.0,
                "is_positive": 1,
                "status": "Completed",
                "category": "income",
                "flag_reason": None,
                "alert": None,
                "timestamp": "3 days ago, 10:00 AM"
            },
            # 3. Legitimate Supermarket
            {
                "id": "TXN-7A44CD",
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
                "alert": None,
                "timestamp": "4 days ago, 08:15 AM"
            }
        ]

    for tx in sample_txs:
        cursor.execute("""
            INSERT INTO transactions (id, user_phone, entity, subtext, channel, channel_type, amount, is_positive, status, category, flag_reason, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (tx["id"], tx["user_phone"], tx["entity"], tx["subtext"], tx["channel"], tx["channel_type"], tx["amount"], tx["is_positive"], tx["status"], tx["category"], tx["flag_reason"], tx["timestamp"]))
        
        # If transaction is flagged, automatically seed a corresponding alert
        if tx.get("status") == "Flagged":
            raw_alert = tx.get("alert")
            alert_dict: Dict[str, Any] = raw_alert if isinstance(raw_alert, dict) else {}
            alert_id = str(alert_dict.get("alert_id") or f"ALT-{uuid.uuid4().hex[:6].upper()}")
            risk_score = float(alert_dict.get("risk_score") or 0.9420)
            flag_reason = tx.get("flag_reason")
            explanation_text = str(alert_dict.get("explanation_text") or flag_reason or "Flagged by federated edge model.")
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
    """Lift hold on transaction and mark alert resolved by transaction_id or alert_id."""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        UPDATE alerts SET status = 'resolved' 
        WHERE transaction_id = ? OR alert_id = ?
    """, (transaction_id, transaction_id))
    
    cursor.execute("""
        UPDATE transactions SET status = 'Completed', flag_reason = NULL 
        WHERE id = ? OR id IN (SELECT transaction_id FROM alerts WHERE alert_id = ?)
    """, (transaction_id, transaction_id))
    
    conn.commit()
    changed = cursor.rowcount > 0
    conn.close()
    return changed


# ─────────────────────────────────────────
# Manager Operations (Branch Portal)
# ─────────────────────────────────────────

def seed_managers():
    """Seed one demo manager per bank node on first run."""
    conn = get_connection()
    cursor = conn.cursor()
    demo_managers = [
        ("MGR-NRB-001", "bank_1", "Nagaland Regional Bank",  "Anurag Kapoor",  hash_pin("112233")),
        ("MGR-MRB-001", "bank_2", "Meghalaya Regional Bank", "Priya Deshpande", hash_pin("223344")),
        ("MGR-UPG-001", "bank_3", "UP Gramin Bank",          "Suresh Yadav",    hash_pin("334455")),
    ]
    for mgr_id, bank_id, bank_name, name, pin_h in demo_managers:
        cursor.execute("SELECT 1 FROM managers WHERE manager_id = ?", (mgr_id,))
        if not cursor.fetchone():
            cursor.execute("""
                INSERT INTO managers (manager_id, bank_id, bank_name, name, pin_hash)
                VALUES (?, ?, ?, ?, ?)
            """, (mgr_id, bank_id, bank_name, name, pin_h))
    conn.commit()
    conn.close()


def authenticate_manager(manager_id: str, pin: str) -> Optional[Dict[str, Any]]:
    """Verify manager_id + SHA-256(pin). Return manager info dict or None."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM managers WHERE manager_id = ?", (manager_id,))
    row = cursor.fetchone()
    conn.close()
    if row is None:
        return None
    if row["pin_hash"] != hash_pin(pin):
        return None
    return {
        "manager_id": row["manager_id"],
        "bank_id": row["bank_id"],
        "bank_name": row["bank_name"],
        "name": row["name"],
    }


def get_fraud_alerts_for_bank(bank_id: str) -> List[Dict[str, Any]]:
    """Return all alerts for a given bank_id, newest first, enriched with transaction and customer details."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT a.alert_id, a.transaction_id, a.user_phone, a.bank_id, a.bank_name,
               a.risk_score, a.status, a.explanation_text, a.timestamp,
               t.entity, t.amount, t.channel, t.subtext, t.channel_type,
               u.name as user_name
        FROM alerts a
        LEFT JOIN transactions t ON a.transaction_id = t.id
        LEFT JOIN users u ON a.user_phone = u.phone
        WHERE a.bank_id = ?
        ORDER BY a.rowid DESC
    """, (bank_id,))
    rows = cursor.fetchall()
    conn.close()
    results: List[Dict[str, Any]] = []
    for r in rows:
        results.append({
            "alert_id": r["alert_id"],
            "transaction_id": r["transaction_id"],
            "user_phone": r["user_phone"],
            "user_name": r["user_name"] or "Account Holder",
            "bank_id": r["bank_id"],
            "bank_name": r["bank_name"],
            "risk_score": r["risk_score"],
            "status": r["status"],
            "explanation_text": r["explanation_text"],
            "timestamp": r["timestamp"],
            "entity": r["entity"] or "Flagged Transaction",
            "amount": r["amount"],
            "channel": r["channel"] or "Direct Debit",
            "subtext": r["subtext"] or "",
            "channel_type": r["channel_type"] or "",
        })
    return results


def get_tickets_for_bank(bank_id: str, status: Optional[str] = None) -> List[Dict[str, Any]]:
    """Return all tickets for a bank, optionally filtered by status."""
    conn = get_connection()
    cursor = conn.cursor()
    if status:
        cursor.execute("""
            SELECT * FROM tickets WHERE bank_id = ? AND status = ? ORDER BY rowid DESC
        """, (bank_id, status))
    else:
        cursor.execute("""
            SELECT * FROM tickets WHERE bank_id = ? ORDER BY rowid DESC
        """, (bank_id,))
    rows = cursor.fetchall()
    conn.close()
    results: List[Dict[str, Any]] = []
    for r in rows:
        timeline = []
        if r["timeline_json"]:
            try:
                import json as _json
                timeline = _json.loads(r["timeline_json"])
            except Exception:
                pass
        results.append({
            "ticket_id": r["ticket_id"],
            "user_phone": r["user_phone"],
            "user_name": r["user_name"],
            "bank_id": r["bank_id"],
            "bank_name": r["bank_name"],
            "tx_id": r["tx_id"],
            "reason": r["reason"],
            "reason_label": r["reason_label"],
            "comments": r["comments"],
            "urgency": r["urgency"],
            "status": r["status"],
            "status_label": r["status_label"],
            "manager_note": r["manager_note"],
            "created_at": r["created_at"],
            "updated_at": r["updated_at"],
            "timeline": timeline,
        })
    return results


def save_ticket(ticket_data: Dict[str, Any]) -> Dict[str, Any]:
    """INSERT OR REPLACE a ticket record."""
    conn = get_connection()
    cursor = conn.cursor()
    timeline_json = ticket_data.get("timeline_json", "[]")
    if isinstance(timeline_json, list):
        import json as _json
        timeline_json = _json.dumps(timeline_json)
    cursor.execute("""
        INSERT OR REPLACE INTO tickets
            (ticket_id, user_phone, user_name, bank_id, bank_name, tx_id,
             reason, reason_label, comments, urgency, status, status_label,
             manager_note, created_at, updated_at, timeline_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        ticket_data.get("ticket_id", f"TKT-{uuid.uuid4().hex[:8].upper()}"),
        ticket_data.get("user_phone", ""),
        ticket_data.get("user_name"),
        ticket_data.get("bank_id", "bank_1"),
        ticket_data.get("bank_name", "Nagaland Regional Bank"),
        ticket_data.get("tx_id"),
        ticket_data.get("reason", "unknown"),
        ticket_data.get("reason_label"),
        ticket_data.get("comments"),
        ticket_data.get("urgency", "high"),
        ticket_data.get("status", "open"),
        ticket_data.get("status_label", "Under Review"),
        ticket_data.get("manager_note"),
        ticket_data.get("created_at", datetime.datetime.now().isoformat()),
        ticket_data.get("updated_at", datetime.datetime.now().isoformat()),
        timeline_json,
    ))
    conn.commit()
    conn.close()
    return ticket_data


def update_ticket_status(
    ticket_id: str,
    new_status: str,
    new_status_label: str,
    manager_note: str,
    timeline_event: str,
    timeline_note: str,
) -> bool:
    """Update ticket status, prepend timeline entry, set updated_at. Return True if found."""
    import json as _json
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tickets WHERE ticket_id = ?", (ticket_id,))
    row = cursor.fetchone()
    if row is None:
        conn.close()
        return False

    # Parse existing timeline
    timeline: List[Dict[str, Any]] = []
    if row["timeline_json"]:
        try:
            timeline = _json.loads(row["timeline_json"])
        except Exception:
            pass

    # Prepend new event
    now_iso = datetime.datetime.now().isoformat()
    timeline.insert(0, {
        "event": timeline_event,
        "note": timeline_note,
        "timestamp": now_iso,
    })

    cursor.execute("""
        UPDATE tickets
        SET status = ?, status_label = ?, manager_note = ?,
            updated_at = ?, timeline_json = ?
        WHERE ticket_id = ?
    """, (new_status, new_status_label, manager_note, now_iso, _json.dumps(timeline), ticket_id))
    conn.commit()
    conn.close()
    return True


# Initialize DB on load
init_db()
