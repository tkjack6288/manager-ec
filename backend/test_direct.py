import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base
from models.user import User
from models.product import Product
from models.wallet import Wallet
from models.order import Order
from schemas.order import OrderCreate, OrderItemCreate
from routers.order import create_order
import json

engine = create_engine("sqlite:///mososhop.db")
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

user = db.query(User).filter_by(email="test_order@example.com").first()
if not user:
    print("User not found")
    sys.exit(1)

prod = db.query(Product).first()

req = OrderCreate(
    items=[OrderItemCreate(product_id=prod.id, quantity=1)],
    use_moso_coin=False,
    shipping_fee=100.0,
    shipping_name="John Doe",
    shipping_phone="123456789",
    shipping_address="123 Main St"
)

try:
    order = create_order(req=req, current_user=user, db=db)
    print("Order created:", order.id)
except Exception as e:
    import traceback
    traceback.print_exc()
