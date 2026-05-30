import os
import sys

sys.path.append(os.path.join(os.getcwd(), 'backend'))

from database import SessionLocal
from models.product import Product

db = SessionLocal()
products = db.query(Product).filter(Product.category.like('%冷藏生鮮%')).limit(5).all()

print(f"Found {len(products)} products with '冷藏生鮮'")
for p in products:
    print(f"Name: {p.name} | Category: {p.category} | Temp: {p.temperature}")
    
db.close()
