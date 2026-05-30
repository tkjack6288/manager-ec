from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class OrderItemCreate(BaseModel):
    product_id: str
    quantity: int
    variant: Optional[str] = None

class OrderCreate(BaseModel):
    """建立訂單 Request"""
    items: List[OrderItemCreate]
    use_moso_coin: float | bool = False # 是否使用 moso 幣全額/部分抵扣 (可為布林或數值)
    shipping_fee: float = 0.0 # 前端傳入的運費
    shipping_name: Optional[str] = None
    shipping_phone: Optional[str] = None
    shipping_address: Optional[str] = None
    note: Optional[str] = None
    shipping_type: str = "home"
    store_id: Optional[str] = None
    store_name: Optional[str] = None

class OrderCancelRequest(BaseModel):
    """取消訂單 Request"""
    cancel_reason: str
    cancel_note: Optional[str] = None

class OrderItemResponse(BaseModel):
    id: str
    product_id: str
    product_name: Optional[str] = None
    product_image: Optional[str] = None
    quantity: int
    unit_price: float
    subtotal: float

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: str
    user_id: str
    user_name: Optional[str] = None
    total_amount: float
    moso_coin_used: float
    final_paid: float
    reward_moso_coin: float
    status: str
    payment_method: str
    shipping_name: Optional[str] = None
    shipping_phone: Optional[str] = None
    shipping_address: Optional[str] = None
    cancel_reason: Optional[str] = None
    cancel_note: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse]
    note: Optional[str] = None
    shipping_type: str = "home"
    store_id: Optional[str] = None
    store_name: Optional[str] = None

    class Config:
        from_attributes = True
