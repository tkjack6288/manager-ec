import uuid
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database import Base

class ProductReview(Base):
    """商品評價模型"""
    __tablename__ = "product_reviews"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False)
    order_item_id = Column(String(36), ForeignKey("order_items.id"), nullable=True) # 用來驗證是否購買且是否已給過評價
    rating = Column(Integer, nullable=False, default=5) # 1-5
    comment = Column(Text, nullable=True)
    status = Column(String(20), nullable=False, default="approved") # approved, hidden
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", backref="reviews")
    product = relationship("Product", backref="reviews")
    order_item = relationship("OrderItem")
