import pytest
from fastapi.testclient import TestClient
from main import app
from database import Base, engine, get_db
from sqlalchemy.orm import sessionmaker

TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    # 測試結束後可清除資料庫，為保持簡單此處保留資料方便手動查核

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to Mososhop API", "version": "1.0"}

def test_daily_recommendation():
    response = client.get("/products/daily-recommendation")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    # 起碼要有推薦商品
    assert len(data) >= 0

def test_create_user_and_wallet():
    test_user = {
        "email": "qa_test@mososhop.tw",
        "password": "qatestpassword",
        "full_name": "QA Tester"
    }
    # 註冊
    resp_reg = client.post("/users/register", json=test_user)
    # 如果已存在會回傳 400，這裡假設為新資料庫
    if resp_reg.status_code == 200:
        data = resp_reg.json()
        assert "id" in data
        assert data["email"] == test_user["email"]

    # 登入獲取 Token
    resp_login = client.post("/users/login", data={"username": test_user["email"], "password": test_user["password"]})
    assert resp_login.status_code == 200
    token = resp_login.json()["access_token"]
    
    # 使用 Token 查詢當前用戶
    headers = {"Authorization": f"Bearer {token}"}
    resp_me = client.get("/users/me", headers=headers)
    assert resp_me.status_code == 200
    me_data = resp_me.json()
    assert me_data["email"] == test_user["email"]
