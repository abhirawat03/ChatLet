from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app.models import User as DB_User, Chat, Message
from app.schemas import UserCreate
# import 

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_user_by_username(db: Session, username: str):
    """Get user by username."""
    return db.query(DB_User).filter(DB_User.username == username).first()

def get_user_by_email(db: Session, email: str):
    """Get user by email."""
    return db.query(DB_User).filter(DB_User.email == email).first()

def create_user(db: Session, user: UserCreate):
    """Create a new user (no roles)."""
    hashed_password = pwd_context.hash(user.password)
    db_user = DB_User(
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, username: str, password: str):
    """Authenticate user with username and password."""
    user = get_user_by_username(db, username)
    if not user:
        return False
    if not pwd_context.verify(password, user.hashed_password):
        return False
    return user

def create_chat(db: Session, participant_ids: list[int], is_group=False, name=None, chat_id=None):
    participants = db.query(DB_User).filter(DB_User.id.in_(participant_ids)).all()

    chat = Chat(
        chat_id=chat_id,     # ✅ Store deterministic unique key
        is_group=is_group,
        name=name
    )

    chat.participants = participants

    db.add(chat)
    db.commit()
    db.refresh(chat)
    return chat


def send_message(db: Session, chat_id: int, sender_id: int, content: str):
    message = Message(content=content, chat_id=chat_id, sender_id=sender_id)
    db.add(message)
    db.commit()
    db.refresh(message)
    return message

def get_messages_for_chat(db: Session, chat_id: int):
    """Return all messages in a chat, sorted by timestamp."""
    return (
        db.query(Message)
        .filter(Message.chat_id == chat_id)
        .order_by(Message.timestamp.asc())
        .all()
    )
