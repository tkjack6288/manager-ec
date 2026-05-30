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

# 模擬過往真實的評價日期
mock_reviews = [
    {"rating": 5, "comment": "水餃皮Q彈，內餡非常飽滿多汁，賣家出貨速度超快，包裝也很完善，值得推薦！", "author": "happy_buyer99", "date": datetime.datetime(2024, 1, 15, 14, 30)},
    {"rating": 5, "comment": "這家的水餃真的是我吃過最好吃的冷凍水餃之一，高麗菜口味很鮮甜，完全不需要沾醬就好吃。", "author": "dumpling_lover_tw", "date": datetime.datetime(2024, 2, 2, 9, 15)},
    {"rating": 4, "comment": "整體味道還不錯，韭菜的香氣很足，不過價格稍稍偏高了一點點。回購率80%。", "author": "amy_chen1985", "date": datetime.datetime(2024, 3, 20, 18, 45)},
    {"rating": 5, "comment": "寄貨迅速！水餃份量大，吃幾個就很有飽足感，而且烹煮時不容易破皮，品質很好！", "author": "foodie_jack", "date": datetime.datetime(2024, 4, 10, 12, 10)}
]

try:
    db = SessionLocal()
    
    # 刪除舊的評價
    db.query(ProductReview).filter(ProductReview.product_id == product_id).delete()
    db.commit()
    
    # 插入新的評價
    for r in mock_reviews:
        email = f"{r['author']}@shopee.mock"
        user = db.query(User).filter_by(email=email).first()
        if not user:
            user = User(
                id=str(uuid.uuid4()),
                email=email,
                name=r['author'],
                auth_provider="local"
            )
            db.add(user)
            db.commit()
        
        user_id = user.id

        review = ProductReview(
            user_id=user_id,
            product_id=product_id,
            rating=r['rating'],
            comment=r['comment'],
            status="approved",
            created_at=r['date']
        )
        db.add(review)
    
    db.commit()
    db.close()
    
    print(f"成功新增 {len(mock_reviews)} 筆包含真實歷史日期的模擬評價。")
except Exception as e:
    print(f"發生錯誤：{e}")
