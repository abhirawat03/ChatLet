import React from 'react'
import { Outlet } from 'react-router-dom';
import Sidebar from "../ui/Sidebar"
import Header from "../ui/Header"
function MainLayout() {
  return (
    <div className="h-screen flex flex-col select-none bg-[#110f0f]">
      <Header/>
      <div className="flex flex-1 overflow-hidden ">
        <Sidebar />
        <Outlet/>
      </div>
    </div>
  )
}

export default MainLayout
