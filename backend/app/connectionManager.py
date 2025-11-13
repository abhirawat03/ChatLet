from fastapi import WebSocket
from typing import Dict, List

# class ConnectionManager:
#     def __init__(self):
#         # key: chat_id, value: list of active WebSockets
#         self.active_connections: Dict[int, List[WebSocket]] = {}

#     async def connect(self, websocket: WebSocket, chat_id: int):
#         await websocket.accept()
#         if chat_id not in self.active_connections:
#             self.active_connections[chat_id] = []
#         self.active_connections[chat_id].append(websocket)

#     def disconnect(self, websocket: WebSocket, chat_id: int):
#         self.active_connections[chat_id].remove(websocket)
#         if len(self.active_connections[chat_id]) == 0:
#             del self.active_connections[chat_id]

#     async def send_personal_message(self, message: str, websocket: WebSocket):
#         await websocket.send_text(message)

#     async def broadcast(self, message: str, chat_id: int):
#         if chat_id in self.active_connections:
#             for connection in self.active_connections[chat_id]:
#                 await connection.send_text(message)

class ConnectionManager:
    def __init__(self):
        # chat_id → list of websocket connections
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, chat_id: str, websocket: WebSocket):
        await websocket.accept()
        if chat_id not in self.active_connections:
            self.active_connections[chat_id] = []
        self.active_connections[chat_id].append(websocket)

    def disconnect(self, chat_id: str, websocket: WebSocket):
        self.active_connections[chat_id].remove(websocket)

        # Clean up empty chat rooms
        if not self.active_connections[chat_id]:
            del self.active_connections[chat_id]

    async def broadcast(self, chat_id: str, message: str):
        if chat_id in self.active_connections:
            for connection in self.active_connections[chat_id]:
                await connection.send_text(message)

manager = ConnectionManager()