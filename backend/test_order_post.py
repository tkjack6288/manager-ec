import os
import sys

sys.path.append(os.path.join(os.getcwd(), 'backend'))

import requests
from database import SessionLocal
from models.user import User
from core.security import create_access_token

db = SessionLocal()
user = db.query(User).first()
if not user:
    print("No user found")
    sys.exit()

token = create_access_token({"sub": user.id})

payload = {
    "items": [],
    "use_moso_coin": False,
    "shipping_fee": 100.0,
    "shipping_name": "Test",
    "shipping_phone": "0912345678",
    "shipping_address": "123 Test St"
}

headers = {"Authorization": f"Bearer {token}"}

res = requests.post("http://localhost:8000/orders/", json=payload, headers=headers)
print(f"Status: {res.status_code}")
print(f"Body: {res.text}")

# Test without trailing slash
res2 = requests.post("http://localhost:8000/orders", json=payload, headers=headers)
print(f"Status 2: {res2.status_code}")
print(f"Body 2: {res2.text}")

db.close()
