import React from 'react'
import { GoInfo } from "react-icons/go";
import { useNavigate} from "react-router-dom";
function ChatHeader({chat}) {
  const navigate = useNavigate();
  // const { chat_id } = useParams();
  console.log("ChatHeader:", chat);
  const currentUsername = localStorage.getItem("username");
  const chatPerson = chat.participants?.find(
    (u) => u.username !== currentUsername
  );
  
  // If it's a group, use chat.name
  let displayName;
  if (chat.is_group){
    displayName = chat.name;
  }else if (chat.participants.length === 1){
    displayName = chat.participants[0].full_name;
  }else if (chatPerson){
    displayName = chatPerson.full_name;
  }
  const handleChatClick = (chatPerson) => {
    if (chatPerson && chatPerson.username) {
      navigate(`/chats/profile/${chatPerson.username}`,{ state: { user: chatPerson } }); // ✅ Correct path
    } else {
      // fallback to own profile if self-chat or no participant found
      navigate(`/chats/profile/${currentUsername}`);
    }
  };
  return (
    <div className='bg-[#110f0f] h-14 px-4 flex flex-row items-center border-b border-b-neutral-700 justify-between'>
      <div className='flex items-center'>
        <div className="w-10 h-10 rounded-full bg-white "></div>
        <h3 className='ml-3 text-base'>{displayName}</h3>
        {/* {
          connected?
          <div className='flex flex-row ml-8 items-center mt-1'>
            <p className='text-xs'>Online</p>
            <div className='w-2 h-2 bg-emerald-700 rounded-2xl flex ml-2 mt-1'></div>
          </div>
          :
          <div className='flex flex-row ml-8 items-center mt-1'>
            <p className='text-xs'>Offline</p>
            <div className='w-2 h-2 bg-red-700 rounded-2xl flex ml-2 mt-1'></div>
          </div>
        } */}
        <div className='flex flex-row ml-8 items-center mt-1'>
            <p className='text-xs'>Online</p>
            <div className='w-2 h-2 bg-emerald-700 rounded-2xl flex ml-2 mt-1'></div>
        </div>
      </div>
      <div className='cursor-pointer' onClick={()=>handleChatClick(chatPerson)}>
        <GoInfo size={32}/> 
      </div>
    </div>
  )
}

export default ChatHeader
