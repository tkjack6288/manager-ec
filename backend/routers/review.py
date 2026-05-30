from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
import os
import json

from database import get_db
from models.review import ProductReview
from models.order import OrderItem, Order
from models.wallet import Wallet, WalletTransaction
from schemas.review import ReviewCreate, ReviewResponse
from core.dependencies import get_current_user

router = APIRouter(prefix="/products", tags=["商品評價"])

def get_reward_coin():
    settings_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'settings.json')
    if os.path.exists(settings_path):
        try:
            with open(settings_path, "r", encoding="utf-8") as f:
                settings = json.load(f)
                return settings.get("review_reward_coin", 50)
        except:
            pass
    return 50

@router.post("/{product_id}/reviews", response_model=ReviewResponse)
def create_review(product_id: str, review_in: ReviewCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """新增商品評價，並給予 Moso 幣回饋"""
    # 檢查訂單明細是否存在，且屬於該使用者
    order_item = db.query(OrderItem).join(Order).filter(
        OrderItem.id == review_in.order_item_id,
        OrderItem.product_id == product_id,
        Order.user_id == current_user.id,
        Order.status == "completed"
    ).first()
    
    if not order_item:
        raise HTTPException(status_code=400, detail="找不到對應的已完成訂單明細，無法評價")
        
    # 檢查是否已評價過
    existing_review = db.query(ProductReview).filter(ProductReview.order_item_id == review_in.order_item_id).first()
    if existing_review:
        raise HTTPException(status_code=400, detail="您已經對此訂單商品評價過了")

    new_review = ProductReview(
        user_id=current_user.id,
        product_id=product_id,
        order_item_id=review_in.order_item_id,
        rating=review_in.rating,
        comment=review_in.comment
    )
    db.add(new_review)
    db.flush()
    
    # 給予 Moso 幣回饋
    reward_amount = float(get_reward_coin())
    if reward_amount > 0:
        wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
        if not wallet:
            wallet = Wallet(user_id=current_user.id, moso_coin=0)
            db.add(wallet)
            db.flush()
            
        wallet.moso_coin = float(wallet.moso_coin) + reward_amount
        
        transaction = WalletTransaction(
            wallet_id=wallet.id,
            transaction_type="review_reward",
            currency="moso_coin",
            amount=reward_amount,
            reference_id=new_review.id,
            description="商品評價回饋"
        )
        db.add(transaction)

    db.commit()
    db.refresh(new_review)
    
    user_name = current_user.name if current_user.name else "匿名"
    
    return ReviewResponse(
        id=new_review.id,
        product_id=new_review.product_id,
        user_name=user_name,
        rating=new_review.rating,
        comment=new_review.comment,
        created_at=new_review.created_at
    )

@router.get("/{product_id}/reviews", response_model=dict)
def get_reviews(product_id: str, db: Session = Depends(get_db)):
    """取得特定商品的評價列表與平均星數"""
    reviews = db.query(ProductReview).filter(ProductReview.product_id == product_id, ProductReview.status == "approved").order_by(ProductReview.created_at.desc()).all()
    
    avg_rating = 0
    if reviews:
        avg_rating = sum(r.rating for r in reviews) / len(reviews)
        
    review_list = []
    for r in reviews:
        user_name = r.user.name if r.user else "匿名"
        review_list.append(ReviewResponse(
            id=r.id,
            product_id=r.product_id,
            user_name=user_name,
            rating=r.rating,
            comment=r.comment,
            created_at=r.created_at
        ))
        
    return {
        "average_rating": round(avg_rating, 1),
        "total_reviews": len(reviews),
        "reviews": review_list
    }
