import os
import sys

sys.path.append(os.path.join(os.getcwd(), 'backend'))

from database import engine, Base
# 確保載入模型，讓 Base 知道有這些 Table
from models.user import User
from models.product import Product
from models.order import Order, OrderItem
from models.wallet import Wallet, WalletTransaction
from models.channel import Channel
from models.external_affiliate import ExternalAffiliate
from models.review import ProductReview

print("正在建立 ProductReview 資料表...")
Base.metadata.create_all(bind=engine)
print("完成！")
