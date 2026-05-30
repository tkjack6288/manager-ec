from pydantic import BaseModel
from typing import Optional

class ChannelBase(BaseModel):
    name: str
    channel_type: str # 'supply' or 'sales'

class ChannelCreate(ChannelBase):
    pass

class ChannelResponse(ChannelBase):
    id: str

    class Config:
        from_attributes = True
