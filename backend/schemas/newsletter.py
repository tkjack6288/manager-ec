from pydantic import BaseModel, EmailStr
from datetime import datetime

class NewsletterSubscribeRequest(BaseModel):
    email: EmailStr

class NewsletterSubscriberResponse(BaseModel):
    id: str
    email: EmailStr
    is_active: bool
    created_at: datetime

    class Config:
        orm_mode = True
