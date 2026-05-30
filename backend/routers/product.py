from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from database import get_db
from models.product import Product
from schemas.product import ProductResponse, ProductCreate
from datetime import datetime, timedelta
import random
import os
from fastapi.responses import RedirectResponse

router = APIRouter(prefix="/products", tags=["商品型錄"])

@router.get("/image/{file_path:path}")
def get_product_image_url(file_path: str):
    """取得 GCP 圖片的驗證網址 (Signed URL) 並重新導向"""
    bucket_name = os.getenv("GCP_BUCKET_NAME")
    if not bucket_name or bucket_name == "your-bucket-name":
        # Fallback to local upload path
        return RedirectResponse(url=f"http://localhost:8000/{file_path}")
        
    try:
        from google.cloud import storage
        client = storage.Client()
        bucket = client.bucket(bucket_name)
        blob = bucket.blob(file_path)
        
        # 產生 15 分鐘有效的 Signed URL
        signed_url = blob.generate_signed_url(
            version="v4",
            expiration=timedelta(minutes=15),
            method="GET",
        )
        return RedirectResponse(url=signed_url)
    except Exception as e:
        print(f"產生 Signed URL 失敗: {e}")
        raise HTTPException(status_code=404, detail="圖片無法存取")

@router.get("/", response_model=List[ProductResponse])
def get_products(db: Session = Depends(get_db), category: str = Query(None), name: str = Query(None), min_price: float = Query(None), max_price: float = Query(None), skip: int = 0, limit: int = 50, sort: str = Query("latest")):
    """取得商品清單，可根據分類、名稱、價格區間進行篩選，並排除金額為 0 的商品"""
    query = db.query(Product).filter(Product.is_active == True, Product.is_sellable == True, Product.selling_price > 0)
    if category:
        query = query.filter(Product.category == category)
    if name:
        query = query.filter(Product.name.ilike(f"%{name}%"))
    if min_price is not None:
        query = query.filter(Product.selling_price >= min_price)
    if max_price is not None:
        query = query.filter(Product.selling_price <= max_price)
    
    if sort == "price_asc":
        query = query.order_by(Product.selling_price.asc())
    elif sort == "price_desc":
        query = query.order_by(Product.selling_price.desc())
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
    
    # 取得所有上架中、可銷售且金額大於 0 的商品
    active_products = db.query(Product).filter(Product.is_active == True, Product.is_sellable == True, Product.selling_price > 0).all()
    if not active_products:
        return []
    
    # 隨機推薦最多 8 筆
    sample_size = min(8, len(active_products))
    recommended = random.sample(active_products, sample_size)
    return recommended

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: str, db: Session = Depends(get_db)):
    """取得單一商品詳細資訊"""
    product = db.query(Product).filter(Product.id == product_id, Product.is_active == True, Product.is_sellable == True).first()
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
        selling_price=prod_in.selling_price,
        supply_channel=prod_in.supply_channel,
        sales_channel=prod_in.sales_channel,
        stock=prod_in.stock,
        category=prod_in.category,
        is_active=prod_in.is_active,
        is_sellable=prod_in.is_sellable
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product
