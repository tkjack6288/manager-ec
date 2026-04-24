from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class OrderItemCreate(BaseModel):
    product_id: str
    quantity: int

class OrderCreate(BaseModel):
    """建立訂單 Request"""
    items: List[OrderItemCreate]
    use_moso_coin: float | bool = False # 是否使用 moso 幣全額/部分抵扣 (可為布林或數值)

class OrderItemResponse(BaseModel):
    id: str
    product_id: str
    quantity: int
    unit_price: float
    subtotal: float

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: str
    user_id: str
    total_amount: float
    moso_coin_used: float
    final_paid: float
    reward_moso_coin: float
    status: str
    payment_method: str
    created_at: datetime
    items: List[OrderItemResponse]

    class Config:
        from_attributes = True
