import { NavLink } from "react-router-dom";
import { AiFillHome } from "react-icons/ai";
import { BiSolidSearchAlt2 } from "react-icons/bi";

function Sidebar() {
  const currentUserId = localStorage.getItem("username");

  return (
    <div className="bg-[#110f0f] h-full w-20 flex flex-col items-center justify-between text-white">
      <nav className="mt-8 flex flex-col items-center gap-6">
        <NavLink to="/chats">
          {({ isActive }) => (
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isActive ? "bg-blue-950" : "hover:bg-blue-950"
                }`}
              >
                <AiFillHome size={34} />
              </div>
              <span className="text-xs font-semibold mt-1">Chats</span>
            </div>
          )}
        </NavLink>

        <NavLink to="/search">
          {({ isActive }) => (
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isActive ? "bg-blue-950" : "hover:bg-blue-950"
                }`}
              >
                <BiSolidSearchAlt2 size={34} />
              </div>
              <span className="text-xs font-semibold mt-1">Search</span>
            </div>
          )}
        </NavLink>
      </nav>

      <div className="mb-5">
        <NavLink to={`/search/profile/${currentUserId}`}>
          {({ isActive }) => (
            <div
              className={`w-10 h-10 rounded-full bg-white border-2 ${
                isActive ? "border-blue-500" : "border-transparent"
              }`}
            ></div>
          )}
        </NavLink>
      </div>
    </div>
  );
}

export default Sidebar;
