import uuid
from sqlalchemy import Column, String, Numeric, Integer, Boolean, DateTime, Text
from datetime import datetime, timezone
from database import Base

class Product(Base):
    """商品實體模型"""
    __tablename__ = "products"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    sku = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Numeric(12, 2), nullable=False)
    stock = Column(Integer, default=0)
    category = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True)
    images = Column(Text, nullable=True) # 儲存 JSON array string
    product_url = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
