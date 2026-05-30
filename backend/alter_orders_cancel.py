import sys
import os

# 確保可以 import database 等模組
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from database import engine

def alter_orders_table():
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE orders ADD COLUMN cancel_reason VARCHAR(50);"))
            print("Successfully added 'cancel_reason' column to orders table.")
        except Exception as e:
            print(f"Error adding 'cancel_reason' (might already exist): {e}")
            
        try:
            conn.execute(text("ALTER TABLE orders ADD COLUMN cancel_note VARCHAR(500);"))
            print("Successfully added 'cancel_note' column to orders table.")
        except Exception as e:
            print(f"Error adding 'cancel_note' (might already exist): {e}")

        conn.commit()

if __name__ == "__main__":
    alter_orders_table()
    print("Database alteration complete.")
