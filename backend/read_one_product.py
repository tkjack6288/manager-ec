from database import SessionLocal
from models.product import Product
import json

db = SessionLocal()
try:
    product = db.query(Product).first()
    if product:
        data = {c.name: getattr(product, c.name) for c in product.__table__.columns}
        print(json.dumps(data, indent=4, ensure_ascii=False, default=str))
    else:
        print("資料表中沒有商品資料。")
finally:
    db.close()
