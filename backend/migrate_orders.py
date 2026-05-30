from sqlalchemy import create_engine, text
import os
from database import SQLALCHEMY_DATABASE_URL

def run_migration():
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    with engine.connect() as conn:
        print("Connected to database. Checking columns in 'orders' table...")
        
        # PostgreSQL specific query to check if column exists
        def column_exists(col_name):
            result = conn.execute(text(f"SELECT column_name FROM information_schema.columns WHERE table_name='orders' AND column_name='{col_name}'"))
            return result.fetchone() is not None

        if not column_exists("note"):
            print("Adding 'note' column...")
            conn.execute(text("ALTER TABLE orders ADD COLUMN note VARCHAR(500)"))
            
        if not column_exists("shipping_type"):
            print("Adding 'shipping_type' column...")
            conn.execute(text("ALTER TABLE orders ADD COLUMN shipping_type VARCHAR(20) DEFAULT 'home'"))
            
        if not column_exists("store_id"):
            print("Adding 'store_id' column...")
            conn.execute(text("ALTER TABLE orders ADD COLUMN store_id VARCHAR(50)"))
            
        if not column_exists("store_name"):
            print("Adding 'store_name' column...")
            conn.execute(text("ALTER TABLE orders ADD COLUMN store_name VARCHAR(100)"))
            
        conn.commit()
        print("Migration completed successfully.")

if __name__ == "__main__":
    run_migration()
