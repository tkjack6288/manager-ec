import os
import sys

sys.path.append(os.path.join(os.getcwd(), 'backend'))

from sqlalchemy import text
from database import engine

def update_selling_price():
    with engine.begin() as conn:
        try:
            # PostgreSQL command
            sql = "UPDATE products SET selling_price = FLOOR(ROUND(price * 1.2) / 10) * 10 + 9 WHERE price IS NOT NULL;"
            conn.execute(text(sql))
            print("Successfully updated selling_price with tail 9 in the database.")
        except Exception as e:
            print("Error updating selling_price:", e)

if __name__ == '__main__':
    update_selling_price()
