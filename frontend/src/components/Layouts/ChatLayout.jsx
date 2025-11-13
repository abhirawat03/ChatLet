import React from 'react'
import { Outlet } from 'react-router-dom'
import ChatList from '../ui/ChatList'
function LeftLayout() {
  return (
    <div className="flex flex-1 rounded-tl-2xl border-t-2 border-l-2 border-neutral-700 bg-[#110f0f] overflow-hidden">
        <div className="w-[350px] border-r-2 border-neutral-700">
            <ChatList />
        </div>
        <div className="flex-1 h-full">
            <Outlet/>
        </div>
    </div>
  )
}

export default LeftLayout
