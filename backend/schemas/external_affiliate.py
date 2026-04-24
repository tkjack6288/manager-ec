from pydantic import BaseModel
from datetime import datetime

class ExternalAffiliateCreate(BaseModel):
    platform_name: str
    transaction_id: str
    transaction_amount: float
    reward_percentage: float # 1~25

class ExternalAffiliateResponse(ExternalAffiliateCreate):
    id: str
    user_id: str
    reward_moso_coin: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
