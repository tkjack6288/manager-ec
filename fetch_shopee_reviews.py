import os
import sys
import json
import urllib.request
import uuid

sys.stdout.reconfigure(encoding='utf-8')

sys.path.append(os.path.join(os.getcwd(), 'backend'))

from database import SessionLocal
from models.review import ProductReview
from models.user import User

product_id = "c71e93b5-bd38-415d-a364-76dc8d0d974f"
shopid = "1160255627"
itemid = "28527780044"
url = f"https://shopee.tw/api/v2/item/get_ratings?filter=0&flag=1&itemid={itemid}&limit=20&offset=0&shopid={shopid}&type=0"

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': '*/*'
}

req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode('utf-8'))
        
    ratings = data.get('data', {}).get('ratings', [])
    if ratings is None:
        ratings = []
        
    if not ratings:
        print("沒有抓取到評價或API回應結構不同。")
        sys.exit(0)

    db = SessionLocal()
    
    user = db.query(User).first()
    if not user:
        user = User(
            id=str(uuid.uuid4()),
            email="shopee_mock_user@example.com",
            name="Shopee 用戶",
            auth_provider="local"
        )
        db.add(user)
        db.commit()
    
    user_id = user.id

    new_reviews = 0
    for r in ratings:
        rating_star = r.get('rating_star', 5)
        comment = r.get('comment', '')
        author_username = r.get('author_username', 'Shopee 用戶')
        if comment:
            # Maybe create a user for each author_username, but let's just use one user to avoid cluttering or use author_username as comment prefix
            full_comment = f"【轉載自 {author_username}】 {comment}"
            review = ProductReview(
                user_id=user_id,
                product_id=product_id,
                rating=rating_star,
                comment=full_comment,
                status="approved"
            )
            db.add(review)
            new_reviews += 1
    
    db.commit()
    db.close()
    
    print(f"成功新增 {new_reviews} 筆評價。")
except Exception as e:
    print(f"發生錯誤：{e}")
