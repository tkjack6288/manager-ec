from database import engine
from sqlalchemy import text

def add_columns():
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE orders ADD COLUMN recipient_name VARCHAR(255);"))
            print("Added recipient_name")
        except Exception as e:
            print(f"Skipped recipient_name: {e}")

        try:
            conn.execute(text("ALTER TABLE orders ADD COLUMN recipient_phone VARCHAR(50);"))
            print("Added recipient_phone")
        except Exception as e:
            print(f"Skipped recipient_phone: {e}")

        try:
            conn.execute(text("ALTER TABLE orders ADD COLUMN recipient_address VARCHAR(500);"))
            print("Added recipient_address")
        except Exception as e:
            print(f"Skipped recipient_address: {e}")
            
        conn.commit()
        print("Database alter completed.")

if __name__ == "__main__":
    add_columns()
