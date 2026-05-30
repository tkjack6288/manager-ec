import os
import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

from database import SessionLocal
from models.product import Product

db = SessionLocal()
try:
    product = db.query(Product).filter(Product.id == "c71e93b5-bd38-415d-a364-76dc8d0d974f").first()
    if product:
        data = {c.name: getattr(product, c.name) for c in product.__table__.columns}
        print(json.dumps(data, indent=4, ensure_ascii=False, default=str))
    else:
        print("找不到 ID 為 c71e93b5-bd38-415d-a364-76dc8d0d974f 的商品資料。")
finally:
    db.close()
