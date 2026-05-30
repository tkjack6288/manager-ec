import sqlite3

def run():
    conn = sqlite3.connect('mososhop.db')
    cursor = conn.cursor()

    try:
        cursor.execute("ALTER TABLE products ADD COLUMN temperature VARCHAR(50) DEFAULT 'normal'")
        conn.commit()
        print("Successfully added temperature column.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("Column temperature already exists.")
        else:
            raise e

    # Now let's fetch 10 products and update them
    cursor.execute("SELECT id, name, category FROM products LIMIT 10")
    products = cursor.fetchall()
    
    for p in products:
        p_id, name, category = p
        
        # Simple heuristic
        temp = "normal"
        if "冷藏" in name or "冷藏" in category:
            temp = "refrigerated"
        elif "冷凍" in name or "冷凍" in category or "水餃" in name or "冰" in name or "肉" in name or "魚" in name or "海鮮" in category:
            temp = "frozen"
            
        print(f"Updating product {name} (Category: {category}) -> {temp}")
        cursor.execute("UPDATE products SET temperature = ? WHERE id = ?", (temp, p_id))
        
    conn.commit()
    conn.close()
    print("Done updating 10 products.")

if __name__ == '__main__':
    run()
