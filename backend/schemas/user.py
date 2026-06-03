from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: Optional[str] = None
    auth_provider: str = "local" # local, google, line

class UserResponse(UserBase):
    id: str
    auth_provider: str
    is_admin: bool
    is_vip: bool
    vip_expires_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
