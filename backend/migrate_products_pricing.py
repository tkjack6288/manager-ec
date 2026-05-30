import sqlite3

def migrate():
    print("Connecting to database...")
    conn = sqlite3.connect("mososhop.db")
    cursor = conn.cursor()

    try:
        # Check if columns exist first
        cursor.execute("PRAGMA table_info(products)")
        columns = [row[1] for row in cursor.fetchall()]

        if "selling_price" not in columns:
            print("Adding selling_price column...")
            cursor.execute("ALTER TABLE products ADD COLUMN selling_price NUMERIC(12, 2) NOT NULL DEFAULT 0;")
        
        if "supply_channel" not in columns:
            print("Adding supply_channel column...")
            cursor.execute("ALTER TABLE products ADD COLUMN supply_channel VARCHAR(255);")
            
        if "sales_channel" not in columns:
            print("Adding sales_channel column...")
            cursor.execute("ALTER TABLE products ADD COLUMN sales_channel VARCHAR(255);")

        print("Updating selling_price to price * 1.1...")
        cursor.execute("UPDATE products SET selling_price = price * 1.1 WHERE selling_price = 0 OR selling_price IS NULL;")
        
        conn.commit()
        print("Migration successful.")
    except Exception as e:
        print(f"Error during migration: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
