from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
import os
import uuid
import shutil
from database import get_db
from models.user import User
from models.order import Order, OrderItem
from models.product import Product
from schemas.order import OrderResponse, OrderCreate
from schemas.product import ProductResponse, ProductCreate
from schemas.user import UserResponse
from core.dependencies import get_current_user

# 如果需要驗證管理員身份，可以在 dependencies 加 get_current_admin
# 目前簡化，暫時只檢查登入狀態或直接開放測試
router = APIRouter(prefix="/admin", tags=["後台管理"])

# --- 檔案上傳 ---

@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    """後台上傳商品圖片"""
    # 確保 uploads 目錄存在
    os.makedirs("uploads", exist_ok=True)
    
    # 產生唯一的檔名
    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join("uploads", filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # 回傳圖片的 URL 路徑 (對應到 main.py 的 StaticFiles)
    return {"url": f"http://localhost:8000/uploads/{filename}"}

# --- 商品管理 ---

@router.get("/products", response_model=List[ProductResponse])
def admin_get_products(search: str = Query(None), skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """後台取得所有商品，包含下架的商品"""
    query = db.query(Product)
    if search:
        # 簡單支援對 name 或 sku 進行模糊查詢
        query = query.filter(Product.name.ilike(f"%{search}%") | Product.sku.ilike(f"%{search}%") | Product.category.ilike(f"%{search}%"))
    return query.order_by(Product.created_at.desc()).offset(skip).limit(limit).all()

@router.post("/products", response_model=ProductResponse)
def admin_create_product(prod_in: ProductCreate, db: Session = Depends(get_db)):
    """後台新增商品"""
    existing_product = db.query(Product).filter(Product.sku == prod_in.sku).first()
    if existing_product:
        raise HTTPException(status_code=400, detail="已經有相同 SKU 的商品存在")
        
    new_product = Product(**prod_in.model_dump())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

@router.put("/products/{product_id}", response_model=ProductResponse)
def admin_update_product(product_id: str, prod_in: dict, db: Session = Depends(get_db)):
    """後台更新商品"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="找不到該商品")
        
    for key, value in prod_in.items():
        if hasattr(product, key):
            setattr(product, key, value)
            
    db.commit()
    db.refresh(product)
    return product

@router.delete("/products/{product_id}")
def admin_delete_product(product_id: str, db: Session = Depends(get_db)):
    """後台刪除商品"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="找不到該商品")
        
    # 通常會用軟刪除 is_active = False，這裡示範實體刪除或軟刪除
    db.delete(product)
    db.commit()
    return {"message": "商品已刪除"}

# --- 訂單管理 ---

@router.get("/orders", response_model=List[OrderResponse])
def admin_get_orders(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """後台取得所有訂單"""
    orders = db.query(Order).order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
    # 手動載入 items 以符合 OrderResponse
    for order in orders:
        order.items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    return orders

@router.put("/orders/{order_id}/status", response_model=OrderResponse)
def admin_update_order_status(order_id: str, status: str, db: Session = Depends(get_db)):
    """後台更新訂單狀態"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="找不到該訂單")
        
    order.status = status
    db.commit()
    db.refresh(order)
    order.items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    return order

# --- 會員管理 ---

@router.get("/users", response_model=List[UserResponse])
def admin_get_users(search: str = Query(None), skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """後台取得所有會員"""
    query = db.query(User)
    if search:
        query = query.filter(User.name.ilike(f"%{search}%") | User.email.ilike(f"%{search}%"))
    return query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()

@router.put("/users/{user_id}/vip")
def admin_toggle_user_vip(user_id: str, is_vip: bool, db: Session = Depends(get_db)):
    """後台設定會員是否為 VIP"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="找不到該會員")
        
    user.is_vip = is_vip
    db.commit()
    db.refresh(user)
    return {"message": "會員 VIP 狀態已更新", "is_vip": user.is_vip}

# --- 系統設定 ---
import json
SETTINGS_FILE = "settings.json"

@router.get("/settings")
def get_system_settings():
    """取得系統設定"""
    if os.path.exists(SETTINGS_FILE):
        with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {
        "site_name": "Mososhop",
        "maintenance_mode": False,
        "reward_percentage": 10,
        "free_shipping_threshold": 1000,
        "free_shipping_threshold_normal": 79,
        "free_shipping_threshold_refrigerated": 150,
        "free_shipping_threshold_frozen": 150
    }

@router.post("/settings")
def update_system_settings(settings: dict):
    """更新系統設定"""
    with open(SETTINGS_FILE, "w", encoding="utf-8") as f:
        json.dump(settings, f, ensure_ascii=False, indent=2)
    return {"message": "系統設定已更新"}
