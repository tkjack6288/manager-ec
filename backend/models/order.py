import uuid
from sqlalchemy import Column, String, Numeric, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database import Base
from models.user import User
from models.product import Product

class Order(Base):
    """訂單實體模型"""
    __tablename__ = "orders"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    total_amount = Column(Numeric(12, 2), nullable=False) # 訂單總額 (折扣前)
    moso_coin_used = Column(Numeric(12, 2), default=0.00) # 使用的 mosocoin 全額或部分抵扣
    final_paid = Column(Numeric(12, 2), nullable=False) # 實際支付現金金額
    reward_moso_coin = Column(Numeric(12, 2), default=0.00) # 本次購物預計回饋 (final_paid * 0.1)
    status = Column(String(50), nullable=False, default="pending") # pending, paid, completed, cancelled
    payment_method = Column(String(50), nullable=False, default="ecpay") # ecpay, wallet (混合支付)
    shipping_name = Column(String(100), nullable=True)
    shipping_phone = Column(String(50), nullable=True)
    shipping_address = Column(String(255), nullable=True)
    merchant_trade_no = Column(String(50), nullable=True)
    trade_no = Column(String(50), nullable=True)
    cancel_reason = Column(String(50), nullable=True)
    cancel_note = Column(String(500), nullable=True)
    note = Column(String(500), nullable=True)
    shipping_type = Column(String(20), nullable=False, default="home")
    store_id = Column(String(50), nullable=True)
    store_name = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", backref="orders")
    items = relationship("OrderItem", backref="order", cascade="all, delete-orphan")

class OrderItem(Base):
    """訂單明細實體模型"""
    __tablename__ = "order_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String(36), ForeignKey("orders.id"), nullable=False)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    unit_price = Column(Numeric(12, 2), nullable=False)
    subtotal = Column(Numeric(12, 2), nullable=False)

    product = relationship("Product")
