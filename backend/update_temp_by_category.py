import os
import sys

sys.path.append(os.path.join(os.getcwd(), 'backend'))

from database import SessionLocal
from models.product import Product

def update_temperatures():
    db = SessionLocal()
    try:
        products = db.query(Product).order_by(Product.id).all()
        for i, p in enumerate(products, 1):
            category = p.category or ""
            
            # 依「分類」進行判斷
            temp = "normal"
            
            # 取分類的最後一層進行判斷，確保子分類的定義優先
            last_category = category.split(">")[-1].strip() if ">" in category else category
            
            if category.strip() == "Uncategorized":
                temp = "frozen"
            elif "冷藏" in last_category:
                temp = "refrigerated"
            elif "冷凍" in last_category or "海鮮" in last_category or "水產" in last_category:
                temp = "frozen"
            else:
                # 如果最後一層沒有明確的冷藏或冷凍，但前面的分類有，我們也可以做為備用參考
                # 不過依據您的指示，以最後一層判斷為準
                pass
                
            p.temperature = temp
            db.add(p)
            print(f"{i}. 名稱: {p.name} | 分類: {category} | 更新溫層: {temp}")
            
        db.commit()
        print(f"\nAll {len(products)} products successfully updated based on category.")
    finally:
        db.close()

if __name__ == '__main__':
    update_temperatures()
