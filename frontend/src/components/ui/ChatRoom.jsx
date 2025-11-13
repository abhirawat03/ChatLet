import { useEffect, useState, useRef } from 'react';
import ChatHeader from './ChatHeader';
import MessageBox from './MessageBox';
import MsgInput from './MsgInput';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import API from '../../api';

function ChatRoom() {
  const navigate = useNavigate();
  const location = useLocation();
  const { chat_id } = useParams();
  const chat = location.state?.chat;
  const fetchChats = location.state?.fetchChats;
  console.log("Chat loaded:", chat);

  const [messages, setMessages] = useState([]);
  const wsRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [inputs, setInputs] = useState({});
  const textValue = inputs[chat_id] || "";

//   const bottomRef = useRef(null);

  // IMPORTANT: make sure you set user_id in localStorage when logging in
  const currentUserId = Number(localStorage.getItem("user_id"));
//   const currentUserId = currentUserIdRaw ? Number(currentUserIdRaw) : null;

  // fetch old messages
  useEffect(() => {
    if (!chat_id) return;
    const fetchMessages = async () => {
      try {
        const res = await API.get(`/chat/${chat_id}/messages`);
        setMessages(res.data || []);
      } catch (err) {
        console.error("Failed to load chat messages:", err);
      }
    };
    fetchMessages();
  }, [chat_id]);

  // connect websocket using ref
  useEffect(() => {
    if (!chat_id || !currentUserId) {
      console.warn("Missing chat_id or currentUserId; skipping WS connect", { chat_id, currentUserId });
      return;
    }

    const wsUrl = `ws://127.0.0.1:8000/ws/${chat_id}/${currentUserId}`;
    console.log("Opening WS:", wsUrl);

    const socket = new WebSocket(wsUrl);
    wsRef.current = socket;

    socket.onopen = () => {
      console.log("✅ WS open for chat:", chat_id);
      setConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        // Only messages of type "message" are appended
        if (payload.type === "message") {
          setMessages((prev) => [...prev, payload]);
          // ✅ Refresh chat list in sidebar
          window.dispatchEvent(new CustomEvent("refreshChatList", { detail: { chatId: chat_id } }));
        } else {
          // handle presence or other types if needed
          console.log("WS event:", payload);
        }
      } catch (err) {
        console.error("Failed to parse WS message:", event.data, err);
      }
    };

    socket.onclose = (ev) => {
      console.warn("🔌 WS closed", ev);
      setConnected(false);
    };

    socket.onerror = (err) => {
      console.error("❌ WS error", err);
    };

    return () => {
      try {
        socket.close();
      } catch {}
      wsRef.current = null;
      setConnected(false);
    };
  }, [chat_id, currentUserId,fetchChats]);

  // scroll to bottom when messages change
  

  // send message function
//   const sendMessage = () => {
//     const ws = wsRef.current;
//     const text = textValue.trim();
//     if (!text) return;

//     if (!ws) {
//       console.warn("WS not initialized");
//       return;
//     }
//     if (ws.readyState !== WebSocket.OPEN) {
//       console.warn("WS is not open (readyState=", ws.readyState, ")");
//       return;
//     }

//     // You are sending plain text — backend expects raw text and uses it as content
//     ws.send(text);
//     // Optionally optimistically add message to UI (so user sees it instantly)
//     setMessages((prev) => [
//       ...prev,
//       {
//         chat_id,
//         user_id: currentUserId,
//         username: localStorage.getItem("username") || "me",
//         full_name: localStorage.getItem("full_name") || "",
//         time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//         content: text,
//         type: "message",
//         // if your backend returns message id/timestamp later, you may replace this optimistic one
//       },
//     ]);
//     setTextValue("");
//   };
const sendMessage = () => {
  const ws = wsRef.current;
  const text = textValue.trim();
  if (!text || !ws || ws.readyState !== WebSocket.OPEN) return;

  ws.send(text);
  window.dispatchEvent(new CustomEvent("refreshChatList", { detail: { chatId: chat_id } }));
  // ✅ Clear only this chat’s input after sending
  setInputs((prev) => ({ ...prev, [chat_id]: "" }));
};


  // keyboard Escape to go back
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") navigate("/chats");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  return (
    <div className='h-full text-white flex flex-col'>
      <div className="h-14">
        <ChatHeader chat={chat} />
      </div>

      <div className="flex-1 overflow-y-auto">
        <MessageBox messages={messages} currentUserId={currentUserId} />
        
      </div>

      <MsgInput
        textValue={textValue}
        onChange={(val) => setInputs((prev) => ({ ...prev, [chat_id]: val }))}
        sendMessage={sendMessage}
      />
    </div>
  );
}

export default ChatRoom;
