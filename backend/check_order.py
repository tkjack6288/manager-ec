import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, os.path.abspath('backend'))
from models.order import Order

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:adminpassword@34.80.36.202:5432/mosodb-ec")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

order = db.query(Order).filter(Order.id == "260503102A324").first()
if order:
    print(f"Order: {order.id}")
    print(f"merchant_trade_no: {order.merchant_trade_no}")
    print(f"trade_no: {order.trade_no}")
    print(f"final_paid: {order.final_paid}")
    print(f"status: {order.status}")
else:
    print("Order not found")
