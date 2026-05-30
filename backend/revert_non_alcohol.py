import os
import sys

sys.path.append(os.path.join(os.getcwd(), 'backend'))

from sqlalchemy import text
from database import engine

def revert_non_alcohol():
    queries = [
        "UPDATE products SET is_sellable = TRUE WHERE name LIKE '%酒櫃%'",
        "UPDATE products SET is_sellable = TRUE WHERE name LIKE '%酒精%'",
        "UPDATE products SET is_sellable = TRUE WHERE name LIKE '%酒店%'",
        "UPDATE products SET is_sellable = TRUE WHERE name LIKE '%酒棉%'",
        "UPDATE products SET is_sellable = TRUE WHERE name LIKE '%牛肉%' AND name LIKE '%酒%'",
        "UPDATE products SET is_sellable = TRUE WHERE name LIKE '%牛%' AND name LIKE '%酒%'",
        "UPDATE products SET is_sellable = TRUE WHERE name LIKE '%香腸%' AND name LIKE '%酒%'",
        "UPDATE products SET is_sellable = TRUE WHERE name LIKE '%酵母%' AND name LIKE '%酒%'",
        "UPDATE products SET is_sellable = TRUE WHERE name LIKE '%酒杯%'"
    ]
    
    with engine.begin() as conn:
        try:
            total_updated = 0
            for q in queries:
                result = conn.execute(text(q))
                total_updated += result.rowcount
            print(f"Successfully reverted is_sellable = TRUE for {total_updated} misidentified products.")
        except Exception as e:
            print("Error updating data:", e)

if __name__ == '__main__':
    revert_non_alcohol()
