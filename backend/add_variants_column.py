import os
from sqlalchemy import text
from database import engine

def add_variants_column():
    print("Connecting to DB...")
    with engine.begin() as conn:
        try:
            # Check if column exists first
            res = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='products' AND column_name='variants'"))
            if res.fetchone() is None:
                print("Adding variants column...")
                conn.execute(text("ALTER TABLE products ADD COLUMN variants TEXT"))
                print("variants column added successfully.")
            else:
                print("variants column already exists.")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    add_variants_column()
