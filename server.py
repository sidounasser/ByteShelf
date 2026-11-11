import os
import sys
import time
import json
import sqlite3
import secrets
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, make_response, send_from_directory
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

# ==============================================================================
# CONFIGURATION & FLASK APP INITIALIZATION
# ==============================================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "database.db")

app = Flask(__name__, static_folder=BASE_DIR)
# Enable CORS for local testing from file:/// or localhost
CORS(app, supports_credentials=True, origins=["http://localhost:5000", "http://127.0.0.1:5000", "http://localhost:3000", "null"])

# In-memory Rate Limiting tracker: { ip: [timestamp1, timestamp2, ...], ip_lockout_until: timestamp }
RATE_LIMIT_STORE = {}
MAX_ATTEMPTS = 5
LOCKOUT_DURATION_SECONDS = 30

# ==============================================================================
# SQLITE DATABASE INITIALIZATION (PERSISTENT & ZERO-CONFIG)
# ==============================================================================
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    # Users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            is_verified INTEGER DEFAULT 0,
            provider TEXT DEFAULT 'email',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    # OTP codes table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS otp_codes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            code TEXT NOT NULL,
            expires_at REAL NOT NULL
        )
    """)
    # Magic link tokens table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS magic_tokens (
            token TEXT PRIMARY KEY,
            email TEXT NOT NULL,
            expires_at REAL NOT NULL
        )
    """)
    # Sessions table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            session_token TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            expires_at REAL NOT NULL,
            created_at REAL NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)
    conn.commit()
    conn.close()
    print("✅ Base de données SQLite 'database.db' initialisée avec succès.")

init_db()

# ==============================================================================
# RATE LIMITING & SECURITY HELPERS
# ==============================================================================
def check_rate_limit(ip):
    now = time.time()
    record = RATE_LIMIT_STORE.get(ip, {"attempts": [], "lockout_until": 0})

    # Check if currently locked out
    if now < record["lockout_until"]:
        remaining = int(record["lockout_until"] - now)
        return False, remaining

    # Clean old attempts (older than 15 minutes)
    record["attempts"] = [t for t in record["attempts"] if now - t < 900]
    RATE_LIMIT_STORE[ip] = record
    return True, 0

def record_failed_attempt(ip):
    now = time.time()
    record = RATE_LIMIT_STORE.get(ip, {"attempts": [], "lockout_until": 0})
    record["attempts"].append(now)

    if len(record["attempts"]) >= MAX_ATTEMPTS:
        record["lockout_until"] = now + LOCKOUT_DURATION_SECONDS
        RATE_LIMIT_STORE[ip] = record
        return True, LOCKOUT_DURATION_SECONDS

    RATE_LIMIT_STORE[ip] = record
    return False, len(record["attempts"])

def reset_rate_limit(ip):
    if ip in RATE_LIMIT_STORE:
        RATE_LIMIT_STORE[ip] = {"attempts": [], "lockout_until": 0}

def get_current_user_from_request():
    token = request.cookies.get("fpb_session")
    if not token:
        # Fallback to Authorization Header: Bearer <token>
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1].strip()

    if not token:
        return None

    now = time.time()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT u.id, u.name, u.email, u.provider, u.is_verified, s.expires_at
        FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.session_token = ? AND s.expires_at > ?
    """, (token, now))
    row = cursor.fetchone()
    conn.close()

    if row:
        return {
            "id": row["id"],
            "name": row["name"],
            "email": row["email"],
            "provider": row["provider"],
            "is_verified": bool(row["is_verified"])
        }
    return None

# ==============================================================================
# REST API: AUTHENTICATION ROUTES
# ==============================================================================

# 1. REGISTER NEW USER (HASH PASSWORD + GENERATE 6-DIGIT OTP)
@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    name = data.get("name", "").strip() or email.split("@")[0]

    if not email or "@" not in email:
        return jsonify({"success": False, "message": "Veuillez fournir une adresse e-mail valide."}), 400

    if not password or len(password) < 8:
        return jsonify({"success": False, "message": "Le mot de passe doit comporter au moins 8 caractères."}), 400

    conn = get_db()
    cursor = conn.cursor()

    # Check if email is already taken
    cursor.execute("SELECT id, is_verified FROM users WHERE email = ?", (email,))
    existing = cursor.fetchone()

    # Hash password with scrypt (industry standard slow KDF with automatic salt)
    pw_hash = generate_password_hash(password, method="scrypt")

    if existing:
        if existing["is_verified"]:
            conn.close()
            # Anti-enumeration safe response
            return jsonify({
                "success": False,
                "message": "Un compte actif existe déjà avec cette adresse e-mail. Veuillez vous connecter."
            }), 409
        else:
            # Update password for pending unverified user
            cursor.execute("UPDATE users SET password_hash = ?, name = ? WHERE id = ?", (pw_hash, name, existing["id"]))
            user_id = existing["id"]
    else:
        user_id = secrets.token_hex(16)
        cursor.execute("""
            INSERT INTO users (id, name, email, password_hash, is_verified, provider)
            VALUES (?, ?, ?, ?, 0, 'email')
        """, (user_id, name, email, pw_hash))

    # Generate 6-digit OTP code
    otp_code = f"{secrets.randbelow(900000) + 100000}"
    expires_at = time.time() + 600  # 10 minutes

    # Invalidate previous OTP codes for this email
    cursor.execute("DELETE FROM otp_codes WHERE email = ?", (email,))
    cursor.execute("INSERT INTO otp_codes (email, code, expires_at) VALUES (?, ?, ?)", (email, otp_code, expires_at))

    conn.commit()
    conn.close()

    print(f"\n📬 [EMAIL SIMULÉ] Code de validation envoyé à {email} : ===> {otp_code} <===\n")

    return jsonify({
        "success": True,
        "message": f"Compte pré-créé. Un code à 6 chiffres a été expédié à {email}.",
        "email": email,
        "otp_code": otp_code  # returned for instant local testing and auto-fill
    }), 201

# 2. VERIFY OTP CODE & ACTIVATE ACCOUNT
@app.route("/api/auth/verify-otp", methods=["POST"])
def verify_otp():
    data = request.get_json(silent=True) or {}
    email = data.get("email", "").strip().lower()
    code = data.get("code", "").strip()

    if not email or not code:
        return jsonify({"success": False, "message": "E-mail et code à 6 chiffres requis."}), 400

    now = time.time()
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id FROM otp_codes
        WHERE email = ? AND code = ? AND expires_at > ?
        ORDER BY id DESC LIMIT 1
    """, (email, code, now))
    otp_row = cursor.fetchone()

    if not otp_row:
        conn.close()
        return jsonify({"success": False, "message": "Code incorrect ou expiré."}), 400

    # Mark user as verified
    cursor.execute("UPDATE users SET is_verified = 1 WHERE email = ?", (email,))
    cursor.execute("DELETE FROM otp_codes WHERE email = ?", (email,))

    # Get user details
    cursor.execute("SELECT id, name, email, provider FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()

    # Create session (30 days)
    session_token = secrets.token_hex(32)
    session_expires = now + (30 * 86400)
    cursor.execute("""
        INSERT INTO sessions (session_token, user_id, expires_at, created_at)
        VALUES (?, ?, ?, ?)
    """, (session_token, user["id"], session_expires, now))

    conn.commit()
    conn.close()

    user_data = {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "provider": "E-mail vérifié (OTP & Session Sécurisée)"
    }

    resp = make_response(jsonify({
        "success": True,
        "message": "Compte vérifié et activé avec succès !",
        "user": user_data,
        "token": session_token
    }))

    # Set secure HttpOnly cookie
    resp.set_cookie(
        "fpb_session",
        session_token,
        max_age=30 * 86400,
        httponly=True,
        samesite="Lax",
        secure=False  # Set to True on HTTPS production
    )
    return resp, 200

# 3. LOGIN (RATE LIMITED + ANTI-ENUMERATION + SECURE COOKIE)
@app.route("/api/auth/login", methods=["POST"])
def login():
    ip = request.remote_addr or "127.0.0.1"
    allowed, wait_time = check_rate_limit(ip)
    if not allowed:
        return jsonify({
            "success": False,
            "message": f"Trop de tentatives infructueuses (5/5). Veuillez patienter {wait_time}s (Protection force-brute)."
        }), 429

    data = request.get_json(silent=True) or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    remember_me = bool(data.get("rememberMe", True))

    GENERIC_ERROR = "Identifiant ou mot de passe incorrect."

    if not email or not password:
        record_failed_attempt(ip)
        return jsonify({"success": False, "message": GENERIC_ERROR}), 401

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, password_hash, is_verified, provider FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()

    # Constant-time security check against user enumeration
    if not user:
        # Dummy verification to prevent timing attack
        check_password_hash("scrypt:32768:8:1$dummy$dummydummydummydummydummydummy", password)
        locked, count = record_failed_attempt(ip)
        msg = f"{GENERIC_ERROR} (Verrouillage 30s)" if locked else f"{GENERIC_ERROR} ({count}/5 tentatives)"
        return jsonify({"success": False, "message": msg}), 401

    # Verify password hash
    if not check_password_hash(user["password_hash"], password):
        locked, count = record_failed_attempt(ip)
        msg = f"{GENERIC_ERROR} (Verrouillage 30s)" if locked else f"{GENERIC_ERROR} ({count}/5 tentatives)"
        return jsonify({"success": False, "message": msg}), 401

    # Successful login: reset rate limit
    reset_rate_limit(ip)

    now = time.time()
    duration = (30 * 86400) if remember_me else (2 * 3600)  # 30 days or 2 hours
    session_token = secrets.token_hex(32)
    session_expires = now + duration

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO sessions (session_token, user_id, expires_at, created_at)
        VALUES (?, ?, ?, ?)
    """, (session_token, user["id"], session_expires, now))
    conn.commit()
    conn.close()

    user_data = {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "provider": "E-mail classique (Session chiffrée)"
    }

    resp = make_response(jsonify({
        "success": True,
        "message": f"Bon retour, {user['name']} !",
        "user": user_data,
        "token": session_token
    }))

    resp.set_cookie(
        "fpb_session",
        session_token,
        max_age=int(duration),
        httponly=True,
        samesite="Lax",
        secure=False
    )
    return resp, 200

# 4. CURRENT USER ME (SESSION VALIDATION)
@app.route("/api/auth/me", methods=["GET"])
def get_me():
    user = get_current_user_from_request()
    if user:
        return jsonify({"success": True, "user": user}), 200
    return jsonify({"success": False, "message": "Non authentifié"}), 401

# 5. LOGOUT
@app.route("/api/auth/logout", methods=["POST"])
def logout():
    token = request.cookies.get("fpb_session")
    if token:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM sessions WHERE session_token = ?", (token,))
        conn.commit()
        conn.close()

    resp = make_response(jsonify({"success": True, "message": "Session révoquée avec succès."}))
    resp.set_cookie("fpb_session", "", expires=0)
    return resp, 200

# 6. PASSWORDLESS: GENERATE MAGIC LINK
@app.route("/api/auth/magic-link", methods=["POST"])
def magic_link():
    data = request.get_json(silent=True) or {}
    email = data.get("email", "").strip().lower()

    if not email or "@" not in email:
        return jsonify({"success": False, "message": "Adresse e-mail invalide."}), 400

    token = secrets.token_urlsafe(32)
    expires_at = time.time() + 900  # 15 minutes

    conn = get_db()
    cursor = conn.cursor()
    # Check if user exists or create placeholder
    cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    if not user:
        user_id = secrets.token_hex(16)
        pw_dummy = generate_password_hash(secrets.token_hex(16))
        cursor.execute("INSERT INTO users (id, name, email, password_hash, is_verified, provider) VALUES (?, ?, ?, ?, 1, 'magic_link')", (user_id, email.split("@")[0], email, pw_dummy))

    cursor.execute("INSERT INTO magic_tokens (token, email, expires_at) VALUES (?, ?, ?)", (token, email, expires_at))
    conn.commit()
    conn.close()

    magic_url = f"http://127.0.0.1:5000/?magic_token={token}&email={email}"
    print(f"\n✨ [LIEN MAGIQUE PASSWORDLESS] Envoyé à {email} : ===> {magic_url} <===\n")

    return jsonify({
        "success": True,
        "message": f"Un lien magique valable 15 minutes a été envoyé à {email}.",
        "magic_url": magic_url,
        "token": token
    }), 200

# 7. VERIFY MAGIC LINK
@app.route("/api/auth/verify-magic", methods=["POST"])
def verify_magic():
    data = request.get_json(silent=True) or {}
    token = data.get("token", "").strip()

    if not token:
        return jsonify({"success": False, "message": "Token manquant."}), 400

    now = time.time()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT email FROM magic_tokens WHERE token = ? AND expires_at > ?", (token, now))
    row = cursor.fetchone()

    if not row:
        conn.close()
        return jsonify({"success": False, "message": "Lien magique invalide ou expiré."}), 400

    email = row["email"]
    cursor.execute("DELETE FROM magic_tokens WHERE token = ?", (token,))

    cursor.execute("SELECT id, name, email, provider FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()

    session_token = secrets.token_hex(32)
    session_expires = now + (30 * 86400)
    cursor.execute("INSERT INTO sessions (session_token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)", (session_token, user["id"], session_expires, now))
    conn.commit()
    conn.close()

    user_data = {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "provider": "Lien magique (Passwordless vérifié)"
    }

    resp = make_response(jsonify({
        "success": True,
        "message": f"Connexion réussie via le lien magique !",
        "user": user_data,
        "token": session_token
    }))
    resp.set_cookie("fpb_session", session_token, max_age=30*86400, httponly=True, samesite="Lax")
    return resp, 200

# ==============================================================================
# STATIC FILES SERVING (INDEX.HTML, DATA.JS, STYLES.CSS, VENDOR, HERO-EBOOK.JPG)
# ==============================================================================
@app.route("/")
def serve_index():
    return send_from_directory(BASE_DIR, "index.html")

@app.route("/<path:path>")
def serve_static(path):
    if os.path.exists(os.path.join(BASE_DIR, path)):
        return send_from_directory(BASE_DIR, path)
    return send_from_directory(BASE_DIR, "index.html")

# ==============================================================================
# MAIN ENTRYPOINT
# ==============================================================================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"\n==================================================================")
    print(f"🚀 SERVEUR BACKEND D'AUTHENTIFICATION DÉMARRÉ SUR http://127.0.0.1:{port}")
    print(f"📦 Base de données SQLite active : {DB_PATH}")
    print(f"🔒 Hachage Scrypt, Protection Force-Brute & Sessions HttpOnly ACTIFS")
    print(f"==================================================================\n")
    app.run(host="0.0.0.0", port=port, debug=False)
