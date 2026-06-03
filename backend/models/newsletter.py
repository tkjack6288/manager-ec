from sqlalchemy import Column, String, Boolean, DateTime
from datetime import datetime, timezone
from database import Base
import uuid

class NewsletterSubscriber(Base):
    """電子報訂閱者實體模型"""
    __tablename__ = "newsletter_subscribers"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
