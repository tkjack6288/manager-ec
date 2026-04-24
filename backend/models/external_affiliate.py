import uuid
from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database import Base
from models.user import User

class ExternalAffiliate(Base):
    """外部導購回饋紀錄模型"""
    __tablename__ = "external_affiliates"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    platform_name = Column(String(100), nullable=False) # PChome, Shopee 等
    transaction_id = Column(String(255), unique=True, nullable=False) # 外部交易序號
    transaction_amount = Column(Numeric(12, 2), nullable=False) # 該平台消費總額
    reward_percentage = Column(Numeric(5, 2), nullable=False) # 回饋比例 1-25%
    reward_moso_coin = Column(Numeric(12, 2), nullable=False) # 計算出的回饋金
    status = Column(String(50), nullable=False, default="pending_review") # pending_review, approved, rejected
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", backref="affiliate_transactions")
