import requests

res = requests.post("http://localhost:8000/users/login", json={
    "email": "test_order@example.com",
    "password": "password"
})
token = res.json().get("access_token")

res = requests.get("http://localhost:8000/orders/me", headers={"Authorization": f"Bearer {token}"})
print("get_my_orders:", res.status_code, res.text[:200])
