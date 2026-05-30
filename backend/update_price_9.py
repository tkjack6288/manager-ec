import os
import sys

sys.path.append(os.path.join(os.getcwd(), 'backend'))

from database import SessionLocal
from models.product import Product

def update_prices():
    db = SessionLocal()
    try:
        products = db.query(Product).all()
        for prod in products:
            if prod.price is not None:
                # 1. 進價 * 1.2
                base_price = float(prod.price) * 1.2
                # 2. 四捨五入到整數位
                rounded_price = round(base_price)
                # 3. 最後一位數一律改為 9
                final_price = (rounded_price // 10) * 10 + 9
                prod.selling_price = final_price
        
        db.commit()
        print(f"Successfully updated selling_price for {len(products)} products.")
    except Exception as e:
        db.rollback()
        print("Error updating selling_price:", e)
    finally:
        db.close()

if __name__ == '__main__':
    update_prices()
