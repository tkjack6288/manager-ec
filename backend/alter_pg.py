import os
import sys

sys.path.append(os.path.join(os.getcwd(), 'backend'))

from sqlalchemy import text
from database import engine

def alter_table():
    with engine.begin() as conn:
        try:
            conn.execute(text("ALTER TABLE products ADD COLUMN selling_price FLOAT"))
            conn.execute(text("ALTER TABLE products ADD COLUMN supply_channel VARCHAR"))
            conn.execute(text("ALTER TABLE products ADD COLUMN sales_channel VARCHAR"))
            # Initialize selling_price to price * 1.1
            conn.execute(text("UPDATE products SET selling_price = price * 1.1 WHERE selling_price IS NULL"))
            print("Successfully added new pricing and channel columns.")
        except Exception as e:
            print("Column already exists or error:", e)

if __name__ == '__main__':
    alter_table()
