import os
from database import engine
from sqlalchemy import text

with engine.connect() as conn:
    result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='products'")).mappings().all()
    for row in result:
        print(dict(row))
