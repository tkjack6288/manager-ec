from database import engine
from sqlalchemy import text

def run():
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;"))
            conn.commit()
            print("Successfully added is_admin column.")
        except Exception as e:
            print(f"Error adding column (maybe it already exists?): {e}")

if __name__ == "__main__":
    run()
