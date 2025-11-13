from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base, engine
from sqlalchemy.sql import func

# Many-to-many for chat participants
chat_participants = Table(
    'chat_participants',
    Base.metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('chat_id', Integer, ForeignKey('chats.id'))
)

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(191), unique=True, index=True)
    email = Column(String(191), unique=True, index=True)
    full_name = Column(String(200))
    hashed_password = Column(String(255))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    last_seen = Column(DateTime, server_default=func.now())

    # 👇 Add this so you can do: user.messages_sent
    messages = relationship("Message", back_populates="sender")
    # 👇 Add this so you can do: user.chats
    chats = relationship("Chat", secondary=chat_participants, back_populates="participants")

class Chat(Base):
    __tablename__ = 'chats'
    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(String(191), unique=True, index=True)
    name = Column(String(191), nullable=True)
    is_group = Column(Boolean, default=False)
    # participants = relationship("User", secondary=chat_participants)

    # 👇 Add this so you can do: chat.messages
    messages = relationship("Message", back_populates="chat",order_by="Message.timestamp.desc()")
    # 👇 Add back_populates to keep 2-way link
    participants = relationship("User", secondary=chat_participants, back_populates="chats")

class Message(Base):
    __tablename__ = 'messages'
    id = Column(Integer, primary_key=True, index=True)
    content = Column(String(1000))
    timestamp = Column(DateTime, server_default=func.now())
    sender_id = Column(Integer, ForeignKey('users.id', ondelete="CASCADE"))
    chat_id = Column(Integer, ForeignKey('chats.id', ondelete="CASCADE"))

    # 👇 Add relationships for access convenience
    sender = relationship("User", back_populates="messages")
    chat = relationship("Chat", back_populates="messages")

Base.metadata.create_all(bind=engine)