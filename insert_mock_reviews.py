import os
import sys
import json
import uuid
import datetime

sys.stdout.reconfigure(encoding='utf-8')

sys.path.append(os.path.join(os.getcwd(), 'backend'))

from database import SessionLocal
from models.review import ProductReview
from models.user import User

product_id = "c71e93b5-bd38-415d-a364-76dc8d0d974f"

mock_reviews = [
    {"rating": 5, "comment": "【轉載自 Shopee 用戶 A】\n水餃很好吃，皮薄餡多，冷凍送到家非常方便，下次還會再買！"},
    {"rating": 5, "comment": "【轉載自 Shopee 用戶 B】\n出貨速度快，包裝很完整。高麗菜口味很鮮甜，家裡小孩很喜歡。"},
    {"rating": 4, "comment": "【轉載自 Shopee 用戶 C】\n口味不錯，韭菜味道很濃，不用沾醬就很好吃，但價格稍微高一點。"}
]

try:
    db = SessionLocal()
    
    user = db.query(User).filter_by(email="shopee_mock@example.com").first()
    if not user:
        user = User(
            id=str(uuid.uuid4()),
            email="shopee_mock@example.com",
            name="Shopee 轉載",
            auth_provider="local"
        )
        db.add(user)
        db.commit()
    
    user_id = user.id

    for r in mock_reviews:
        review = ProductReview(
            user_id=user_id,
            product_id=product_id,
            rating=r['rating'],
            comment=r['comment'],
            status="approved"
        )
        db.add(review)
    
    db.commit()
    db.close()
    
    print(f"成功新增 {len(mock_reviews)} 筆模擬評價。")
except Exception as e:
    print(f"發生錯誤：{e}")
