import React from 'react';

function Chat({chat}) {
  const currentUsername = localStorage.getItem("username");
  // Find the other participant (not current user)
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

  return (
    <div className="flex items-center h-14 px-4 mb-1 cursor-pointer rounded-xl transition-colors duration-150 ease-in-out hover:bg-blue-700 ">
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-white "></div> 

      {/* Chat info */}
      <div className="flex flex-col justify-center ml-4 overflow-hidden">
        <h3 className="text-lg font-semibold text-white">{displayName}</h3>
        <p className="text-[13px] text-gray-300">{chat.last_message.content}</p>
      </div>
    </div>
  );
}

export default Chat;
