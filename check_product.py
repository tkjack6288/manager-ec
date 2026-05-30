import os
import sys
import sqlite3

db_path = r"d:\jay\ai\antigravity\manager-ec\backend\mososhop.db"

try:
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute("SELECT id, name, is_active FROM products WHERE id = ?", ("c71e93b5-bd38-415d-a364-76dc8d0d974f",))
    row = c.fetchone()
    if row:
        print(f"Product found: ID={row[0]}, Name={row[1]}, is_active={row[2]}")
    else:
        print("Product not found.")
        
    c.execute("SELECT id, user_id, product_id FROM product_reviews WHERE product_id = ?", ("c71e93b5-bd38-415d-a364-76dc8d0d974f",))
    reviews = c.fetchall()
    print(f"Found {len(reviews)} reviews for this product.")
    
    conn.close()
except Exception as e:
    print(f"Error: {e}")
