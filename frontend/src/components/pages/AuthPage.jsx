import React from 'react'
import { Outlet } from 'react-router-dom'

function AuthPage() {
    return (
        <div className="flex flex-row h-screen justify-center items-center bg-[#110f0f] text-white">
            <div className="flex items-center mr-40">
                <img src="/images/login.png" alt="chatImage" className="w-[550px]"/>
            </div>
            <div className="flex flex-col items-center">
                <div className="flex flex-col items-center space-x-3">
                    <img src="/images/Chatlet.png" alt="chatlet" className="w-20 h-20"/>
                    <h2 className="text-8xl mb-4 font-logo font-extrabold">ChatLet</h2>
                </div>
                <Outlet/>
            </div>
        </div>
    )
}

export default AuthPage