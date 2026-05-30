import requests
import json

# 1. Login
res = requests.post("http://localhost:8000/users/login", json={
    "email": "test_order@example.com",
    "password": "password"
})
token = res.json().get("access_token")

# 2. Check wallet
wallet_res = requests.get("http://localhost:8000/wallets/me", headers={"Authorization": f"Bearer {token}"})
print("Initial wallet:", wallet_res.text)

# 3. Create Order
prod_id = requests.get("http://localhost:8000/products/").json()[0]["id"]
order_res = requests.post("http://localhost:8000/orders/", json={
    "items": [{"product_id": prod_id, "quantity": 1}],
    "use_moso_coin": False,
    "shipping_fee": 100,
    "payment_method": "ecpay",
    "shipping_name": "Test",
    "shipping_phone": "123",
    "shipping_address": "Test"
}, headers={"Authorization": f"Bearer {token}"})
order = order_res.json()
print("Order created:", order["id"])

# 5. Cancel Order via ADMIN API
cancel_res = requests.put(f"http://localhost:8000/admin/orders/{order['id']}/status?status=cancelled")
print("Cancel Order Response:", cancel_res.status_code)

# 6. Check wallet again
wallet_res2 = requests.get("http://localhost:8000/wallets/me", headers={"Authorization": f"Bearer {token}"})
print("Final wallet:", wallet_res2.text)
