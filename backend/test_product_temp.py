import os
import sys

sys.path.append(os.path.join(os.getcwd(), 'backend'))

from database import SessionLocal
from models.product import Product

db = SessionLocal()
product = db.query(Product).filter(Product.name.like('%Maro 清新風行控油護髮素%')).first()

if product:
    print(f"Name: {product.name}")
    print(f"Category: {product.category}")
    print(f"Temperature: {product.temperature}")
else:
    print("Product not found.")
    
db.close()
