import sqlalchemy
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:adminpassword@34.80.36.202:5432/mosodb-ec")
engine = sqlalchemy.create_engine(DATABASE_URL)

with engine.connect() as conn:
    try:
        conn.execute(sqlalchemy.text("ALTER TABLE orders ADD COLUMN merchant_trade_no VARCHAR(50)"))
        print("added merchant_trade_no")
    except Exception as e:
        print(e)

    try:
        conn.execute(sqlalchemy.text("ALTER TABLE orders ADD COLUMN trade_no VARCHAR(50)"))
        print("added trade_no")
    except Exception as e:
        print(e)
        
    conn.commit()

# Also update sqlite for local testing just in case
engine_local = sqlalchemy.create_engine("sqlite:///backend/mososhop.db")
with engine_local.connect() as conn_local:
    try:
        conn_local.execute(sqlalchemy.text("ALTER TABLE orders ADD COLUMN merchant_trade_no VARCHAR(50)"))
        print("added merchant_trade_no (sqlite)")
    except Exception as e:
        print(e)

    try:
        conn_local.execute(sqlalchemy.text("ALTER TABLE orders ADD COLUMN trade_no VARCHAR(50)"))
        print("added trade_no (sqlite)")
    except Exception as e:
        print(e)
        
    conn_local.commit()
