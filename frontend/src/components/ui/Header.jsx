import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom"
function Header() {
  const navigate = useNavigate();
  const [loggedOut, setLoggedOut] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setLoggedOut(true); // trigger navigation
  };
  const full_name = localStorage.getItem("full_name")

  useEffect(() => {
    if (loggedOut) {
      navigate("/auth", { replace: true });
    }
  }, [loggedOut, navigate]);

  return (
    <div className="w-full h-12 px-2 text-white bg-[#110f0f] flex">
      <div className="flex flex-row items-center w-full mx-6 justify-between">
        <div className="">
          <NavLink to="/chats">
            <div className="flex flex-row items-center space-x-2">
              <img src="/images/Chatlet.png" alt="chatlet" className="w-8 h-8"/>
              <h2 className="text-3xl mb-2 font-logo font-extrabold">ChatLet</h2>
            </div>
          </NavLink>
        </div>
        <div className="flex flex-row items-center space-x-3">
          <h1>Welcome, {full_name}!</h1>
          <button className="font-mono bg-blue-950 hover:bg-blue-900 px-4 py-1 rounded-xl" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </div>
  )
}

export default Header
