from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routers import user, wallet, order, external_affiliate, product, payment, admin, chat, logistics, review, newsletter
import os

app = FastAPI(title="Mososhop API", description="Mososhop 電商系統後端 API", version="1.0.0")

# 設定 CORS (允許前台 localhost:3000 或其他網域存取)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000", 
        "https://manager-ec-frontend-164815154526.asia-east1.run.app",
        "https://www.moso.com.tw",
        "https://moso.com.tw"
    ],
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
app.include_router(chat.router)
app.include_router(logistics.router)
app.include_router(review.router)
app.include_router(newsletter.router)
# 掛載上傳目錄
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def read_root():
    return {"message": "Welcome to Mososhop API"}
