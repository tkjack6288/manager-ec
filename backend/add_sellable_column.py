import os
import sys

sys.path.append(os.path.join(os.getcwd(), 'backend'))

from sqlalchemy import text
from database import engine

def migrate_is_sellable():
    with engine.begin() as conn:
        try:
            # 1. 新增欄位 (如果已存在會報錯，但有 try-except 包著)
            conn.execute(text("ALTER TABLE products ADD COLUMN is_sellable BOOLEAN DEFAULT TRUE"))
            print("Successfully added is_sellable column.")
        except Exception as e:
            print("Column might already exist:", e)

        try:
            # 2. 針對「酒類」商品設定為不可銷售
            result_alcohol = conn.execute(text("UPDATE products SET is_sellable = FALSE WHERE name LIKE '%酒%'"))
            print(f"Updated {result_alcohol.rowcount} alcohol products to is_sellable = FALSE.")
            
            # 3. 針對 price = 0 且 selling_price = 9 的商品，設定為 selling_price = 0, is_sellable = FALSE
            # 注意 PostgreSQL 的 NUMERIC 比較
            result_zero = conn.execute(text("UPDATE products SET selling_price = 0, is_sellable = FALSE WHERE price = 0 AND selling_price = 9"))
            print(f"Updated {result_zero.rowcount} zero-price products to selling_price = 0 and is_sellable = FALSE.")
        except Exception as e:
            print("Error updating data:", e)

if __name__ == '__main__':
    migrate_is_sellable()
