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
    specifications = Column(Text, nullable=True)
    price = Column(Numeric(12, 2), nullable=False)
    selling_price = Column(Numeric(12, 2), nullable=False, default=0)
    supply_channel = Column(String(255), nullable=True)
    sales_channel = Column(String(255), nullable=True)
    stock = Column(Integer, default=0)
    category = Column(String(100), nullable=False)
    temperature = Column(String(50), default="normal") # normal, refrigerated, frozen
    is_active = Column(Boolean, default=True)
    is_sellable = Column(Boolean, default=True)
    images = Column(Text, nullable=True) # 儲存 JSON array string
    product_url = Column(Text, nullable=True)
    variants = Column(Text, nullable=True) # 儲存 JSON array string 例如 ["L", "M", "S", "XS"]
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
