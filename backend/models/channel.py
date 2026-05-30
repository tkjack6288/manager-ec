import uuid
from sqlalchemy import Column, String, DateTime
from datetime import datetime, timezone
from database import Base

class Channel(Base):
    """通路管理實體模型"""
    __tablename__ = "channels"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    channel_type = Column(String(50), nullable=False) # 'supply' 或 'sales'
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
