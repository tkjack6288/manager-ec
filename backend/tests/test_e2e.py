import pytest
import sys
import os
import uuid
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from main import app
from database import Base, engine, get_db
from sqlalchemy.orm import sessionmaker
from models.product import Product

# 建立獨立的測試資料庫連線
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_and_teardown_db():
    # 建立所有表單
    Base.metadata.create_all(bind=engine)
    
    # 寫入測試用商品資料
    db = TestSessionLocal()
    prod = db.query(Product).filter(Product.sku == "TEST-SKU-001").first()
    if not prod:
        prod = Product(
            sku="TEST-SKU-001",
            name="E2E 測試專用商品",
            description="自動化測試",
            price=2000,
            stock=99999,
            category="測試",
            is_active=True
        )
        db.add(prod)
    else:
        prod.stock = 99999
        db.add(prod)
    db.commit()
    db.close()
    
    yield
    # 這裡暫時不 drop_all 方便除錯

def test_full_business_workflow():
    test_id = uuid.uuid4().hex[:6]
    payload = {
        "email": f"e2e_user_{test_id}@mososhop.tw",
        "password": "securepassword",
        "name": "E2E Tester"
    }
    
    # 1. 測試會員註冊
    resp_reg = client.post("/users/register", json=payload)
    # 若被建立過則略過
    if resp_reg.status_code == 200:
        assert resp_reg.json()["email"] == payload["email"]
    
    # 2. 測試登入
    resp_login = client.post("/users/login", json={"email": payload["email"], "password": payload["password"]})
    assert resp_login.status_code == 200
    token = resp_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 3. 測試獲取使用者與錢包狀態
    resp_me = client.get("/users/me", headers=headers)
    assert resp_me.status_code == 200
    user_data = resp_me.json()
    assert user_data.get("vip_expires_at") is None # 初始非 VIP
    
    resp_wallet = client.get("/wallets/me", headers=headers)
    assert resp_wallet.status_code == 200
    wallet_data = resp_wallet.json()
    assert wallet_data["cash_balance"] == 0
    assert wallet_data["moso_coin"] == 0
    
    # 4. 測試 1000 元儲值 => 免年費 VIP
    resp_deposit = client.post("/wallets/deposit", json={"amount": 1000}, headers=headers)
    assert resp_deposit.status_code == 200
    
    resp_me2 = client.get("/users/me", headers=headers)
    user_data2 = resp_me2.json()
    assert user_data2.get("vip_expires_at") is not None # 已經變為 VIP
    
    # 5. 測試購物與回饋機制
    # 查詢商品
    resp_prods = client.get("/products")
    assert resp_prods.status_code == 200
    products = resp_prods.json()
    test_prod = next(p for p in products if p["sku"] == "TEST-SKU-001")
    
    order_payload = {
        "items": [
            {"product_id": test_prod["id"], "quantity": 1} # 價格 2000
        ],
        "use_moso_coin": 0,
        "payment_method": "ecpay"
    }
    resp_order = client.post("/orders", json=order_payload, headers=headers)
    assert resp_order.status_code == 200
    order_data = resp_order.json()
    assert order_data["total_amount"] == 2000
    assert order_data["final_paid"] == 2000
    assert order_data["moso_coin_used"] == 0
    assert order_data["reward_moso_coin"] == 200 # 2000 * 10%
    
    # 檢查錢包 Moso 幣是否增加
    resp_wallet2 = client.get("/wallets/me", headers=headers)
    assert resp_wallet2.json()["moso_coin"] == 200
    
    # 6. 使用 Moso 幣折抵購物
    order_payload2 = {
        "items": [
            {"product_id": test_prod["id"], "quantity": 1} # 價格 2000
        ],
        "use_moso_coin": True, # 開啟 Moso Coin 全額/部分折抵
        "payment_method": "ecpay"
    }
    resp_order2 = client.post("/orders", json=order_payload2, headers=headers)
    assert resp_order2.status_code == 200
    order_data2 = resp_order2.json()
    assert order_data2["final_paid"] == 1800 # 2000 - 200
    assert order_data2["moso_coin_used"] == 200
    assert order_data2["reward_moso_coin"] == 180 # 1800 * 10%
    
    # 最終錢包 Moso 幣檢查: 原本200 - 使用200 + 獲得180 = 180
    resp_wallet3 = client.get("/wallets/me", headers=headers)
    assert resp_wallet3.json()["moso_coin"] == 180
    
    # 7. 測試外部平台導購回饋
    affiliate_payload = {
        "platform_name": "TestPlatform",
        "transaction_id": f"EXT-{test_id}",
        "transaction_amount": 10000,
        "reward_percentage": 5.0 # 5%回饋 = 500
    }
    resp_aff = client.post("/affiliates/", json=affiliate_payload, headers=headers)
    assert resp_aff.status_code == 200
    
    # 總額檢查: 原 180 + 500 = 680
    resp_wallet4 = client.get("/wallets/me", headers=headers)
    assert resp_wallet4.json()["moso_coin"] == 680

    print("\nE2E 商業邏輯測試全數通過！")
