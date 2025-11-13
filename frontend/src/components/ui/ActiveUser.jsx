import React from 'react'

function ActiveUser({user}) {
  return (
    <div className="flex flex-col cursor-pointer space-y-2.5">
      {/* Avatar */}
      <div className='relative'>
        <div className="w-20 h-20 rounded-full bg-white flex-shrink-0"></div>
        <div className='w-3 h-3 bg-emerald-700 rounded-2xl flex items-center absolute right-2 bottom-1'></div>
      </div>
      {/* Chat info */}
      <h3 className="text-xs font-medium text-center text-white">{user.username}</h3>
    </div>
  ) 
}

export default ActiveUser
