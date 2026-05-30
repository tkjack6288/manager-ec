import os
import sys

sys.path.append(os.path.join(os.getcwd(), 'backend'))

from sqlalchemy import text
from database import engine

def fetch_alcohol_products():
    with engine.connect() as conn:
        try:
            result = conn.execute(text("SELECT name FROM products WHERE name LIKE '%酒%'"))
            with open('alcohol_names.txt', 'w', encoding='utf-8') as f:
                for idx, row in enumerate(result, 1):
                    f.write(f"{idx}. {row[0]}\n")
            print("Done writing to alcohol_names.txt")
        except Exception as e:
            print("Error fetching data:", e)

if __name__ == '__main__':
    fetch_alcohol_products()
