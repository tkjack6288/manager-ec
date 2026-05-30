import sqlalchemy
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:adminpassword@34.80.36.202:5432/mosodb-ec")
engine = sqlalchemy.create_engine(DATABASE_URL)

with engine.connect() as conn:
    try:
        conn.execute(sqlalchemy.text("ALTER TABLE orders ADD COLUMN shipping_name VARCHAR(100)"))
        print("added shipping_name")
    except Exception as e:
        print(e)

    try:
        conn.execute(sqlalchemy.text("ALTER TABLE orders ADD COLUMN shipping_phone VARCHAR(50)"))
        print("added shipping_phone")
    except Exception as e:
        print(e)
        
    try:
        conn.execute(sqlalchemy.text("ALTER TABLE orders ADD COLUMN shipping_address VARCHAR(255)"))
        print("added shipping_address")
    except Exception as e:
        print(e)

    conn.commit()
