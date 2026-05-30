import os
import sys

# 把當前目錄加入 sys.path 確保能匯入 backend 模組
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from database import SessionLocal
from models.order import Order
from models.user import User

db = SessionLocal()
order = db.query(Order).filter(Order.id == '260509309K212').first()
if order:
    print(f"Order user_id: {order.user_id}")
    user = db.query(User).filter(User.id == order.user_id).first()
    if user:
        print(f"User email: {user.email}")
    else:
        print("User not found in DB!")
else:
    print("Order not found!")
db.close()
