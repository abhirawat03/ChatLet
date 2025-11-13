from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

    # id:int
class UserBase(BaseModel):
    username: str
    email: str
    full_name:str

class UserLogin(BaseModel):
    username:str
    password:str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    is_active: bool 
    class Config:
        from_attributes = True
class UserResponse(UserBase):
    id:int
    is_active: bool 
    class Config:
        from_attributes = True

class ChatBase(BaseModel):
    is_group: bool = False
    name: Optional[str] = None
    participants: List[UserBase] = []
    # participant_ids: List[User]

class LastMessage(BaseModel):
    id: int
    content: str
    timestamp: datetime

    class Config:
        from_attributes = True

class Chat(ChatBase):
    id: int
    chat_id: str
    last_message: Optional[LastMessage] = None

    class Config:
        from_attributes = True


class MessageBase(BaseModel):
    content: str

class Message(MessageBase):
    id: int
    timestamp: datetime
    sender_id: int
    chat_id: int
    class Config:
        from_attributes = True

class AuthResponse(User):
    access_token: str
    refresh_token: str
    token_type: str

class RefreshRequest(BaseModel):
    refresh_token: str