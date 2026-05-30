import sqlite3

def upgrade():
    conn = sqlite3.connect('backend/mososhop.db')
    cursor = conn.cursor()
    try:
        cursor.execute('ALTER TABLE orders ADD COLUMN shipping_name VARCHAR(100)')
        print("Added shipping_name")
    except Exception as e:
        print(e)
        
    try:
        cursor.execute('ALTER TABLE orders ADD COLUMN shipping_phone VARCHAR(50)')
        print("Added shipping_phone")
    except Exception as e:
        print(e)

    try:
        cursor.execute('ALTER TABLE orders ADD COLUMN shipping_address VARCHAR(255)')
        print("Added shipping_address")
    except Exception as e:
        print(e)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    upgrade()
