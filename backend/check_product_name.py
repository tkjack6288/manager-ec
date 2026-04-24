from database import engine
from sqlalchemy import text

product_ids = [
    "0ae8b1df-5743-414b-95ea-c0b58f6fa7cf",
    "64a3edb9-41eb-4ea8-8f44-5d6028536e68",
    "bd8baa04-3b86-4adf-85bb-ab321dc20997",
    "fce03b3e-162b-4cd2-a716-035c8f06df0a"
]

with engine.connect() as conn:
    for pid in product_ids:
        name = conn.execute(text("SELECT name FROM products WHERE id = :id"), {"id": pid}).scalar()
        print(f"ID {pid} -> {name}")
