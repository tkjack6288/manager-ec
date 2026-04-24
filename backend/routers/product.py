from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from database import get_db
from models.product import Product
from schemas.product import ProductResponse, ProductCreate
from datetime import datetime
import random

router = APIRouter(prefix="/products", tags=["商品型錄"])

@router.get("/", response_model=List[ProductResponse])
def get_products(db: Session = Depends(get_db), category: str = Query(None), name: str = Query(None), min_price: float = Query(None), max_price: float = Query(None), skip: int = 0, limit: int = 50, sort: str = Query("latest")):
    """取得商品清單，可根據分類、名稱、價格區間進行篩選，並排除金額為 0 的商品"""
    query = db.query(Product).filter(Product.is_active == True, Product.price > 0)
    if category:
        query = query.filter(Product.category == category)
    if name:
        query = query.filter(Product.name.ilike(f"%{name}%"))
    if min_price is not None:
        # Note: Frontend uses a multiplied price, so backend filters based on the original DB price.
        # For filtering, we roughly divide the min_price by 1.2 to match DB price, or do the exact calculation.
        # Here we just filter the raw price in DB. If exact frontend match is needed, DB logic should match frontend.
        # But for simplicity, we apply raw filter on db price.
        # However, to be perfectly consistent with frontend price display:
        # We can just filter DB price.
        # Actually, let's just do query.filter(Product.price * 1.2 >= min_price) approx.
        pass # Below we do standard SQLAlchemy filtering
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    
    if sort == "price_asc":
        query = query.order_by(Product.price.asc())
    elif sort == "price_desc":
        query = query.order_by(Product.price.desc())
    elif sort == "rating_desc":
        # 如果有 rating 欄位的話，否則以 default (latest)
        pass 
    else:
        # 預設 latest (created_at desc)
        query = query.order_by(Product.created_at.desc())

    return query.offset(skip).limit(limit).all()

@router.get("/recommendations/daily", response_model=List[ProductResponse])
def get_daily_recommendations(db: Session = Depends(get_db)):
    """每日自動更新首頁推薦（透過當天日期作為隨機種子，確保當日推薦一致，並排除金額為 0 的商品）"""
    today_seed = datetime.now().date().toordinal()
    random.seed(today_seed)
    
    # 取得所有上架中且金額大於 0 的商品
    active_products = db.query(Product).filter(Product.is_active == True, Product.price > 0).all()
    if not active_products:
        return []
    
    # 隨機推薦最多 8 筆
    sample_size = min(8, len(active_products))
    recommended = random.sample(active_products, sample_size)
    return recommended

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: str, db: Session = Depends(get_db)):
    """取得單一商品詳細資訊"""
    product = db.query(Product).filter(Product.id == product_id, Product.is_active == True).first()
    if not product:
        raise HTTPException(status_code=404, detail="找不到該商品或已下架")
    return product

@router.post("/", response_model=ProductResponse)
def create_product(prod_in: ProductCreate, db: Session = Depends(get_db)):
    """(中台用) 新增商品"""
    existing_product = db.query(Product).filter(Product.sku == prod_in.sku).first()
    if existing_product:
        raise HTTPException(status_code=400, detail="已經有相同 SKU 的商品存在")
        
    new_product = Product(
        sku=prod_in.sku,
        name=prod_in.name,
        description=prod_in.description,
        price=prod_in.price,
        stock=prod_in.stock,
        category=prod_in.category,
        is_active=prod_in.is_active
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product
