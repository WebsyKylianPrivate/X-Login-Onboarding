#!/usr/bin/env python3
import hmac
import hashlib
import json
import urllib.parse
import random
from datetime import datetime

BOT_TOKEN = "8421940715:AAHLxbVBevOVvb979vTqr3rhQdRYdhMBupY"

def generate_telegram_hash(data):
    """Génère un hash Telegram valide"""
    # Construire le data_check_string
    # Exclure hash et signature du calcul
    data_check_arr = []
    
    for key, value in data.items():
        if key not in ["hash", "signature"]:
            data_check_arr.append(f"{key}={value}")
    
    # Trier comme demandé dans la doc Telegram
    data_check_arr.sort()
    data_check_string = "\n".join(data_check_arr)
    
    # Secret key = HMAC_SHA256("WebAppData", bot_token)
    secret_key = hmac.new(
        "WebAppData".encode(),
        BOT_TOKEN.encode(),
        hashlib.sha256
    ).digest()
    
    # Calcul du hash
    hash_value = hmac.new(
        secret_key,
        data_check_string.encode(),
        hashlib.sha256
    ).hexdigest()
    
    return hash_value

def generate_query_id():
    """Génère un query_id au format Telegram (base64-like)"""
    import base64
    import secrets
    # Format: AAEaLuQTAwAAABou5BOsZdxV (22 caractères, base64)
    random_bytes = secrets.token_bytes(16)
    query_id = base64.b64encode(random_bytes).decode('utf-8').rstrip('=').replace('+', 'A').replace('/', 'B')
    return query_id[:22]

def generate_signature():
    """Génère une signature factice (base64-like)"""
    import base64
    import secrets
    # Format: a4hHsnzblXl9_KVFpHGAjcYkI4dOavWCRa2FcVl42DY2XZ3bpKgvVFMXRNy2ZPRULFEYqdWQMEpSpuoIKqELAA
    random_bytes = secrets.token_bytes(32)
    signature = base64.b64encode(random_bytes).decode('utf-8').rstrip('=').replace('+', 'a').replace('/', 'b')
    return signature[:86]  # Longueur typique d'une signature Telegram

def generate_test_hash(user_id, username, first_name, last_name=""):
    """Génère un hash de test pour un utilisateur au format réel Telegram"""
    auth_date = int(datetime.now().timestamp())
    
    user_data = {
        "id": user_id,
        "first_name": first_name,
        "last_name": last_name,
        "username": username,
        "language_code": "fr",
        "is_premium": True,
        "allows_write_to_pm": True,
    }
    
    # Format réel de Telegram avec query_id et signature
    init_data = {
        "query_id": generate_query_id(),
        "user": json.dumps(user_data, separators=(',', ':')),  # Pas d'espaces dans le JSON
        "auth_date": str(auth_date),
        "signature": generate_signature(),
    }
    
    # Générer le hash (sans signature dans le calcul)
    hash_value = generate_telegram_hash(init_data)
    init_data["hash"] = hash_value
    
    # Construire la string initData
    init_data_string = urllib.parse.urlencode(init_data)
    init_data_encoded = urllib.parse.quote(init_data_string)
    
    return {
        "initData": init_data_string,
        "initDataEncoded": init_data_encoded,
        "hash": hash_value,
        "userData": user_data,
    }

print("🔑 Génération de hash de test avec le token du bot\n")
print(f"Token utilisé: {BOT_TOKEN[:10]}...{BOT_TOKEN[-10:]}\n")

test_users = [
    {"id": 6776172058, "username": "christ_chtr", "firstName": "Christina Charpentier", "lastName": ""},
    {"id": 123456789, "username": "test_user_1", "firstName": "Test User 1", "lastName": ""},
    {"id": 987654321, "username": "test_user_2", "firstName": "Test User 2", "lastName": ""},
    {"id": 111222333, "username": "test_user_3", "firstName": "Test User 3", "lastName": ""},
    {"id": 444555666, "username": "test_user_4", "firstName": "Test User 4", "lastName": ""},
    {"id": 777888999, "username": "test_user_5", "firstName": "Test User 5", "lastName": ""},
]

print("📋 6 hash de test générés:\n")

for index, user in enumerate(test_users, 1):
    result = generate_test_hash(user["id"], user["username"], user["firstName"], user.get("lastName", ""))
    
    print(f"\n{index}. Utilisateur: @{user['username']} (ID: {user['id']})")
    print(f"   Hash: {result['hash']}")
    print(f"   initData (raw): {result['initData']}")
    print(f"   initData (encoded): {result['initDataEncoded']}")
    print(f"   ──────────────────────────────────────────────")

print("\n\n💡 Pour tester avec curl:")
print("curl -X POST https://acepot.app/api/jobs/start \\")
print("  -H 'Content-Type: application/json' \\")
print("  -d '{\"initData\": \"COLLER_LE_initData_encoded_ICI\"}'")

