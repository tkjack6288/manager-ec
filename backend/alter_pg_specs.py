import os
import sys

sys.path.append(os.path.join(os.getcwd(), 'backend'))

from sqlalchemy import text
from database import engine

def alter_table():
    with engine.begin() as conn:
        try:
            conn.execute(text("ALTER TABLE products ADD COLUMN specifications TEXT"))
            print("Successfully added specifications column.")
        except Exception as e:
            print("Column already exists or error:", e)

if __name__ == '__main__':
    alter_table()
