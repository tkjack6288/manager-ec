import os
import sys

sys.path.append(os.path.join(os.getcwd(), 'backend'))

from database import SessionLocal
from models.product import Product

mock_products = [
    {"sku": "MOCK-001", "name": "頂級特鮮北海道鮭魚", "category": "海鮮", "price": 450, "stock": 50},
    {"sku": "MOCK-002", "name": "手工鮮蝦冷凍水餃", "category": "冷凍食品", "price": 250, "stock": 100},
    {"sku": "MOCK-003", "name": "鮮奶布丁蛋糕", "category": "冷藏甜點", "price": 300, "stock": 30},
    {"sku": "MOCK-004", "name": "高山高麗菜", "category": "生鮮蔬菜", "price": 80, "stock": 80},
    {"sku": "MOCK-005", "name": "有機玫瑰鹽手工香皂", "category": "生活用品", "price": 120, "stock": 200},
    {"sku": "MOCK-006", "name": "台灣小農純蜂蜜", "category": "乾貨", "price": 600, "stock": 40},
    {"sku": "MOCK-007", "name": "日本 A5 和牛火鍋肉片", "category": "肉品", "price": 1200, "stock": 20},
    {"sku": "MOCK-008", "name": "精選無調味綜合堅果", "category": "零食", "price": 350, "stock": 150},
    {"sku": "MOCK-009", "name": "冰涼冷藏檸檬氣泡水", "category": "飲料", "price": 45, "stock": 300},
]

db = SessionLocal()
try:
    for p_data in mock_products:
        # Check if already exists
        if not db.query(Product).filter(Product.sku == p_data["sku"]).first():
            new_p = Product(
                sku=p_data["sku"],
                name=p_data["name"],
                category=p_data["category"],
                price=p_data["price"],
                stock=p_data["stock"]
            )
            db.add(new_p)
    db.commit()
    print("Dummy products added.")

    # Now update temperatures
    products = db.query(Product).limit(10).all()
    for p in products:
        temp = "normal"
        name = p.name
        category = p.category
        if "冷藏" in name or "冷藏" in category:
            temp = "refrigerated"
        elif "冷凍" in name or "冷凍" in category or "水餃" in name or "冰" in name or "肉" in name or "魚" in name or "海鮮" in category:
            temp = "frozen"
        p.temperature = temp
        db.add(p)
    
    db.commit()

    # Print out the updated products
    print("\n--- Updated 10 Products ---")
    products = db.query(Product).limit(10).all()
    for i, p in enumerate(products, 1):
        print(f"{i}. 名稱: {p.name} | 分類: {p.category} | 溫層: {p.temperature}")

finally:
    db.close()
