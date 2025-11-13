import {useEffect, useState} from "react";
import Chat from "./Chat";
import Active from "./Active";
import { NavLink, useNavigate, useLocation} from "react-router-dom";
import API from '../../api';

function ChatList() {
  const [chats, setChats] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  // const handleChatClick = (chatId) => {
  //   navigate(`/chats/chat`); // navigate to ChatRoom with dynamic id
  // };
  const fetchChats = async() => {
      try {
        const res = await API.get("/chat/my"); // ✅ call your FastAPI endpoint
        setChats(res.data);
      } catch (err) {
        console.error("Error fetching chats:", err);
      } finally {
        // setLoading(false);
      }
    };
    const moveChatToTop = (chatId) => {
  setChats((prevChats) => {
    const chatToMove = prevChats.find((c) => c.chat_id === chatId);
    if (!chatToMove) return prevChats;
    const remaining = prevChats.filter((c) => c.chat_id !== chatId);
    return [chatToMove, ...remaining];
  });
};

  useEffect(()=>{
    fetchChats(); // call it
    const handleRefresh = (e) => {
    // If event contains chatId, reorder it locally
    if (e.detail?.chatId) {
      moveChatToTop(e.detail.chatId);
    } else {
      fetchChats();
    }
  };
    window.addEventListener("refreshChatList", handleRefresh);

    return () => window.removeEventListener("refreshChatList", handleRefresh);
  }, [])

  // const chats = Array.from({ length: 0 });
  const currentChatId = location.pathname.split("/").pop();
  return (
    <div className=" h-full pt-3 text-white flex flex-col bg-[#110f0f] overflow-hidden">
      {/* <div >   */}
        <Active/>
      {/* </div> */}
      <h1 className="px-4 font-bold text-2xl text-white">Chats</h1>
      <div className="mb-0 mt-2 px-1 overflow-x-scroll scrollbar-hide"> 
        {chats.length === 0 ? (
          <div className="text-center mt-25 text-gray-300 text-4xl py-10 font-logo font-extrabold">
            <h1>No chats yet 😕</h1>
            <span className="text-3xl text-gray-400">
              Start a conversation to see it here.
            </span>
          </div>
        ) : (
          chats.map((chat) =>{
            const isActive = String(chat.chat_id) === currentChatId;
            return(
            <div
              key={chat.id}
              onClick={() =>
                navigate(`/chats/chat/${chat.chat_id}`, { state: { chat}})
              }
              className={`block rounded-xl transition-colors duration-200 cursor-pointer ${
                  isActive ? "bg-[#2a2a2a]" : "bg-transparent"
                } hover:bg-[#1a1a1a]`}

            >
              <Chat chat={chat} />
            </div>
          );
        })
        )}
      </div>
    </div>
  );
}

export default ChatList;
