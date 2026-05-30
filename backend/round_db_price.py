import os
import sys

sys.path.append(os.path.join(os.getcwd(), 'backend'))

from sqlalchemy import text
from database import engine

def round_selling_price():
    with engine.begin() as conn:
        try:
            conn.execute(text("UPDATE products SET selling_price = ROUND(selling_price)"))
            print("Successfully rounded selling_price to nearest integer in the database.")
        except Exception as e:
            print("Error updating selling_price:", e)

if __name__ == '__main__':
    round_selling_price()
