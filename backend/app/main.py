from fastapi import FastAPI, Depends, HTTPException, WebSocket, status, Body, WebSocketDisconnect, Query
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc
from sqlalchemy import or_
from jose import JWTError
from app.database import Base, engine, get_db
from app import models,schemas, crud, auth
from app.auth import (
    create_access_token, create_refresh_token ,get_current_active_user,
    verify_refresh_token, decode_token,get_current_user, get_current_user_from_token
)
from app.schemas import UserCreate, AuthResponse, User, UserResponse, UserLogin, RefreshRequest
from app.connectionManager import manager
import json
from datetime import datetime
from typing import List
import os 
from dotenv import load_dotenv
load_dotenv()

app = FastAPI()

origins=os.getenv("CORS_ORIGINS","").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
online_users = {}  # user_id -> True/False
last_seen = {}     # user_id -> timestamp string

@app.get('/')
def home():
    return 'Welcome Home'

@app.post("/register", response_model= AuthResponse)
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check if user already exists
    if crud.get_user_by_username(db, username=user.username):
        raise HTTPException(status_code=400, detail="Username is taken")

    if crud.get_user_by_email(db, email=user.email):
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = crud.create_user(db=db, user=user)

    # 🔑 Issue tokens immediately (auto-login)
    access_token = create_access_token(data={"sub": new_user.username})
    refresh_token = create_refresh_token(data={"sub": new_user.username})

    return {
        "username": new_user.username,
        "email": new_user.email,
        "full_name": new_user.full_name,
        "is_active": not new_user.is_active,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@app.get("/users/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    """Get current user information."""
    return current_user

@app.get("/users/search", response_model=List[UserResponse])
async def search_users(q: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    results = (
        db.query(models.User)
        .filter(
            or_(
            models.User.username.ilike(f"{q}%"),
            models.User.full_name.ilike(f"{q}%")
            )
        )
        .all() 
    )
    return results

@app.post("/login")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm= Depends(),db: Session = Depends(get_db)):
    """Authenticate user and return access token."""
    user = crud.authenticate_user(db, form_data.username, form_data.password)
    print("Received username:", form_data.username)
    print("Received password:", form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user. Please contact admin.",
        )

    access_token = create_access_token(data={"sub": user.username})
    refresh_token = create_refresh_token(data={"sub": user.username})
    return {
        "access_token": access_token, 
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@app.post("/refresh")
async def refresh_access_token(
    data: RefreshRequest,
    db: Session = Depends(get_db)
):
    refresh_token = data.refresh_token
    if not refresh_token:
        raise HTTPException(status_code=400, detail="Missing refresh_token")

    username = verify_refresh_token(refresh_token)
    db_user = crud.get_user_by_username(db, username=username)

    if not db_user or not db_user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")

    access_token = create_access_token(data={"sub": username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.websocket("/ws/online")
async def online_status_ws(websocket: WebSocket, token: str, db: Session = Depends(get_db)):
    await websocket.accept()

    try:
        user = get_current_user_from_token(token, db)
    except HTTPException as e:
        # 👇 This prevents the "closed before established" error
        print(f"❌ Invalid token in WebSocket: {e.detail}")
        await websocket.close(code=4001)
        return
    except JWTError as e:
        print(f"❌ JWT decoding failed: {e}")
        await websocket.close(code=4002)
        return

    user_id = user.id
    online_users[user_id] = True
    print(f"✅ {user.username} connected")

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        online_users[user_id] = False
        user.last_seen = datetime.utcnow()
        db.commit()
        print(f"🔴 {user.username} disconnected")

@app.websocket("/ws/{chat_id}/{user_id}")
async def websocket_endpoint(websocket: WebSocket, chat_id: str, user_id: int, db: Session = Depends(get_db)):
    # await websocket.accept()
    await manager.connect(chat_id, websocket)
    # now = datetime.now()
    # current_time = now.strftime("%H:%M")
    online_users[user_id] = True
    print(f"✅ User {user_id} connected to chat {chat_id}")
    try:
        while True:
            data = await websocket.receive_text()
            now = datetime.utcnow()
            # await manager.send_personal_message(f"You wrote: {data}", websocket)
            chat = db.query(models.Chat).filter(models.Chat.chat_id == chat_id).first()
            if not chat:
                print("⚠️ Chat not found:", chat_id)
                continue

            sender = db.query(models.User).filter(models.User.id == user_id).first()
            if not sender:
                print("⚠️ Sender not found:", user_id)
                continue
            
            new_message = models.Message(
                content=data,
                sender_id=user_id,
                chat_id=chat.id,
                timestamp=now
            )
            db.add(new_message)
            db.commit()
            db.refresh(new_message)

            message = {
                "chat_id": chat_id,
                "sender_id": user_id,
                "username": sender.username,
                "full_name": sender.full_name,
                "time": now.strftime("%H:%M"),
                "content": data,
                "type": "message"
            }
            await manager.broadcast(chat_id, json.dumps(message))
            print(f"📨 Message broadcasted in chat {chat_id} from {sender.username}")
            
    except WebSocketDisconnect:
        # ✅ Remove user connection from this chat room
        manager.disconnect(chat_id, websocket)

        # ✅ Mark user offline + store last seen
        online_users[user_id] = False

        # ✅ Update last_seen in DB using injected db
        user = db.query(models.User).filter(models.User.id == user_id).first()
        user.last_seen = datetime.utcnow()
        db.commit()

        print(f"🔴 User {user.username} disconnected from chat {chat_id}")

        # ✅ Broadcast presence change (optional but recommended)
        # presence_update = {
        #     "chat_id": chat_id,
        #     "user_id": user_id,
        #     "status": "offline",
        #     "last_seen": last_seen[user_id],
        #     "type": "presence"
        # }

        # await manager.broadcast(chat_id, json.dumps(presence_update))
        # offline_message = {
        #     "time": datetime.now().strftime("%H:%M"),
        #     "clientId": user_id,
        #     "message": "Offline",
        #     "chat_id": chat_id
        # }
        # await manager.broadcast(chat_id,json.dumps(offline_message))


@app.post("/chat/dm", response_model=schemas.Chat)
def create_dm(
    # user_id: int = Body(...),
    user_id: int = Body(..., embed=True),   
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Create or return a unique 1-on-1 DM chat."""
    print("Received user_id:", user_id)
    # if user_id == current_user.id:
    #     raise HTTPException(status_code=400, detail="Cannot create DM with yourself.")

    # ✅ Check if the other user exists
    other_user = db.get(models.User, user_id)
    if not other_user:
        raise HTTPException(status_code=404, detail="User not found.")

    # ✅ Generate unique chat key (sorted usernames to avoid duplicates)
    chat_key = "_".join(sorted([current_user.username, other_user.username]))

    # ✅ Check if DM already exists using chat_key
    existing_chat = (
        db.query(models.Chat)
        .filter(models.Chat.chat_id == chat_key, models.Chat.is_group == False)
        .first()
    )

    if existing_chat:
        print("🔁 Returning existing chat:", existing_chat.chat_id)
        return existing_chat

    # ✅ Create new DM using your existing CRUD function
    new_chat = crud.create_chat(
        db,
        participant_ids=[current_user.id, user_id],
        is_group=False,
        chat_id=chat_key   # <-- we pass the unique key here
    )
    print("✨ New chat created:", new_chat.chat_id)
    return new_chat

@app.get("/chat/my", response_model=List[schemas.Chat])
def get_my_chats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )

    # 🧩 Subquery: get latest message timestamp per chat
    last_msg_time = (
        db.query(models.Message.chat_id, func.max(models.Message.timestamp).label("last_time"))
        .group_by(models.Message.chat_id)
        .subquery()
    )

    """Return all chats where current user participates."""
    # 🧠 Join chats with that subquery
    # chats = (
    #     db.query(models.Chat)
    #     .join(models.chat_participants)
    #     .outerjoin(last_msg_time, models.Chat.id == last_msg_time.c.chat_id)
    #     .filter(models.chat_participants.c.user_id == current_user.id)
    #     .order_by(desc(last_msg_time.c.last_time))  # newest first
    #     .distinct()
    #     .all()
    # )
    # chats = (
    #     db.query(models.Chat)
    #     # .options(joinedload(models.Chat.participants))
    #     .join(models.chat_participants)
    #     .filter(models.chat_participants.c.user_id == current_user.id)
    #     .distinct()
    #     .all()
    # )
    chats = (
        db.query(models.Chat)
        .join(models.chat_participants)
        .outerjoin(last_msg_time, models.Chat.id == last_msg_time.c.chat_id)
        .filter(models.chat_participants.c.user_id == current_user.id)
        .options(joinedload(models.Chat.participants))  # load users in each chat
        .order_by(desc(last_msg_time.c.last_time))  # sort by latest message
        .distinct()
        .all()
    )
    # ✅ Attach last_message manually (so it’s included in your Pydantic schema)
    for chat in chats:
        chat.last_message = chat.messages[0] if chat.messages else None
    return chats

@app.get("/chat/{chat_id}/messages", response_model=List[schemas.Message])
def get_chat_messages(chat_id: str, db: Session = Depends(get_db)):
    chat = db.query(models.Chat).filter(models.Chat.chat_id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    messages = crud.get_messages_for_chat(db, chat.id)
    return messages


@app.get("/active-users")
def get_active_users(user_id: int | None = None, db: Session = Depends(get_db)):
    # ✅ CASE 1: Returning status for a single user
    if user_id is not None:
        if online_users.get(user_id):
            return {"status": "online"}

        user = db.query(models.User).filter(models.User.id == user_id).first()
        if user and user.last_seen:
            return {
                "status": "offline",
                "last_seen": user.last_seen.strftime("%d %b %Y, %H:%M")
            }

        return {"status": "offline", "last_seen": "recently"}

    # ✅ CASE 2: Returning list of all online users
    online_ids = [uid for uid, online in online_users.items() if online]
    users = db.query(models.User).filter(models.User.id.in_(online_ids)).all()

    return [
        {
            "id": u.id,
            "username": u.username,
            "full_name": u.full_name
        }
        for u in users
    ]