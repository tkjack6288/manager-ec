import os
import sys
import sqlite3

db_path = r"d:\jay\ai\antigravity\manager-ec\backend\mososhop.db"
product_id = "c71e93b5-bd38-415d-a364-76dc8d0d974f"

try:
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute("DELETE FROM product_reviews WHERE product_id = ?", (product_id,))
    conn.commit()
    conn.close()
    print("Deleted previous reviews for product.")
except Exception as e:
    print(f"Error: {e}")
