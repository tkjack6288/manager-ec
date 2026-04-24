from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routers import user, wallet, order, external_affiliate, product, payment, admin
import os

app = FastAPI(title="Mososhop API", description="Mososhop 電商系統後端 API", version="1.0.0")

# 設定 CORS (允許前台 localhost:3000 或其他網域存取)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # 生產環境應該指定明確網域
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 註冊路由
app.include_router(user.router)
app.include_router(wallet.router)
app.include_router(order.router)
app.include_router(external_affiliate.router)
app.include_router(product.router)
app.include_router(payment.router)
app.include_router(admin.router)

# 掛載上傳目錄
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def read_root():
    return {"message": "Welcome to Mososhop API"}
