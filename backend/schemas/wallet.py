from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class WalletBase(BaseModel):
    cash_balance: float
    moso_coin: float

class WalletTransactionResponse(BaseModel):
    id: str
    wallet_id: str
    transaction_type: str
    currency: str
    amount: float
    reference_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class WalletResponse(WalletBase):
    id: str
    user_id: str
    updated_at: datetime
    transactions: List[WalletTransactionResponse] = []

    class Config:
        from_attributes = True
