import json
from database import SessionLocal
from sqlalchemy import select
from models.product import Product

def check():
    db = SessionLocal()
    categories = db.execute(select(Product.category).distinct()).scalars().all()
    with open("categories.json", "w", encoding="utf-8") as f:
        json.dump([c for c in categories if c], f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    check()
