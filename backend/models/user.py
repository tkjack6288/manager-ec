import uuid
from sqlalchemy import Boolean, Column, String, DateTime
from datetime import datetime, timezone
from database import Base

class User(Base):
    """會員實體模型"""
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=True) # 單一登入 (SSO) 可能無密碼
    auth_provider = Column(String(50), nullable=False, default="local") # local, google, line
    name = Column(String(100), nullable=False)
    is_admin = Column(Boolean, default=False)
    is_vip = Column(Boolean, default=False)
    vip_expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
