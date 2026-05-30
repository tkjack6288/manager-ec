from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProductBase(BaseModel):
    sku: Optional[str] = None
    name: str
    description: Optional[str] = None
    specifications: Optional[str] = None
    price: float
    selling_price: float = 0
    supply_channel: Optional[str] = None
    sales_channel: Optional[str] = None
    stock: Optional[int] = 0
    category: Optional[str] = None
    temperature: Optional[str] = "normal"
    is_active: bool = True
    is_sellable: bool = True
    images: Optional[str] = None
    product_url: Optional[str] = None
    variants: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
