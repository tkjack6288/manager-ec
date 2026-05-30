import os
import sys
import json

sys.path.append(os.path.join(os.getcwd(), 'backend'))

from database import SessionLocal
from models.product import Product

db = SessionLocal()
try:
    product = db.query(Product).filter(Product.name.like("%德國法茲貴族 甜白葡萄酒 375毫升%")).first()
    if product:
        data = {c.name: getattr(product, c.name) for c in product.__table__.columns}
        print(json.dumps(data, indent=4, ensure_ascii=False, default=str))
    else:
        print("找不到名稱包含 '德國法茲貴族 甜白葡萄酒 375毫升' 的商品資料。")
finally:
    db.close()
