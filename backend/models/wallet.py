import uuid
from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database import Base
from models.user import User

class Wallet(Base):
    """數位錢包：記錄現金與 moso 幣餘額"""
    __tablename__ = "wallets"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    cash_balance = Column(Numeric(12, 2), default=0.00)
    moso_coin = Column(Numeric(12, 2), default=0.00)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", backref="wallet")

class WalletTransaction(Base):
    """錢包異動明細"""
    __tablename__ = "wallet_transactions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    wallet_id = Column(String(36), ForeignKey("wallets.id"), nullable=False)
    transaction_type = Column(String(50), nullable=False) # deposit, spend, reward
    currency = Column(String(20), nullable=False) # cash, moso_coin
    amount = Column(Numeric(12, 2), nullable=False)
    reference_id = Column(String(255), nullable=True) # 關聯單號
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    wallet = relationship("Wallet", backref="transactions")
