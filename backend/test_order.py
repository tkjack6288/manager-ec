import requests

# 2. login
res = requests.post("http://localhost:8000/users/login", json={
    "email": "test_order@example.com",
    "password": "password"
})
print("login:", res.status_code, res.text)

token = res.json().get("access_token")

# 3. get a product
res = requests.get("http://localhost:8000/products/")
prod_id = res.json()[0].get("id")
print("Using product", prod_id)

# 4. create order
res = requests.post("http://localhost:8000/orders/", json={
    "items": [{"product_id": prod_id, "quantity": 1}],
    "use_moso_coin": False,
    "shipping_fee": 100,
    "payment_method": "ecpay",
    "shipping_name": "John Doe",
    "shipping_phone": "0912345678",
    "shipping_address": "123 Main St"
}, headers={"Authorization": f"Bearer {token}"})
print("order:", res.status_code, res.text)
