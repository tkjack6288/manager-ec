import os
import sys

sys.path.append(os.path.join(os.getcwd(), 'backend'))

from database import SessionLocal
from models.product import Product

db = SessionLocal()
product_id = "c71e93b5-bd38-415d-a364-76dc8d0d974f"

try:
    product = db.query(Product).filter(Product.id == product_id).first()
    if product:
        print(f"Product found in PG: ID={product.id}, Name={product.name}, is_active={product.is_active}, is_sellable={product.is_sellable}")
    else:
        print("Product NOT FOUND in PG.")
finally:
    db.close()
