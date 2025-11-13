// import { useState } from "react";
// import { useLocation, useNavigate, useParams } from "react-router-dom";
// import API from "../../api";
// function Profile() {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const user = location.state?.user;
//   const {username} = useParams();
//   const [loading, setLoading] = useState(false);

//   const handleMessageClick = async () => {
//   setLoading(true);
//   console.log("user:", user);
//   try {
//     // Send POST request with user_id
//     const response = await API.post("/chat/dm",{
//       user_id: user.id
//     },
//     {
//   headers: { "Content-Type": "application/json" }
//   });

//     const chat = response.data;
//     console.log("✅ Chat created or fetched:", chat);

//     // Navigate to chat screen
//     navigate(`/chats/chat/${chat.chat_id}`, { state: { chat  } });
//   } catch (error) {
//     console.error("❌ Failed to start chat:", error);
//     const msg = error.response?.data?.detail || "Something went wrong starting the chat.";
//     alert(msg);
//   } finally {
//     setLoading(false);
//   }
// };
//   return (
//     <div className='pt-10 flex flex-col items-center justify-center text-white space-y-8'>
//         <div className='flex flex-row items-center'>
//             <div className="w-40 h-40 rounded-full bg-white"></div>
//             <div className='ml-8 space-y-2.5'>
//                 <h1 className='text-3xl font-bold'>{user.username}</h1>
//                 <p className='text-xl'>{user.full_name}</p>
//                 <p>“It always seems impossible until it’s done.”</p>
//             </div>
//         </div>
//         <div className='flex flex-row space-x-7'>
//             {/* {isOwnProfile && (
//               <button className='w-50 h-12 bg-neutral-800 rounded-2xl hover:bg-neutral-700'>
//                 Edit Profile
//               </button>
//             )} */}
//             <button className='w-60 h-12 bg-neutral-800 rounded-2xl hover:bg-neutral-700'>Edit Profile</button>
//             <button className='w-60 h-12 bg-neutral-800 rounded-2xl hover:bg-neutral-700'
//             onClick={handleMessageClick}
//             disabled={loading}
//             // className={`w-60 h-12 rounded-2xl ${
//             //   loading
//             //     ? "bg-neutral-700 cursor-not-allowed"
//             //     : "bg-neutral-800 hover:bg-neutral-700"
//             // }`}
//             >
//               {/* Message */}
//               {loading ? "Opening..." : "Message"}
//               </button>
//         </div>
//     </div>
//   )
// }

// export default Profile
import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import API from "../../api";

function Profile() {
  const location = useLocation();
  const navigate = useNavigate();
  const { username } = useParams();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Current logged-in user info
  const currentUsername = localStorage.getItem("username");
  const currentUserId = Number(localStorage.getItem("user_id"));
  const currentFullName = localStorage.getItem("full_name");

  // ✅ Fetch self profile if viewing own username
  useEffect(() => {
  const fetchProfile = async () => {
    try {
      setUser(null);
      if (username === currentUsername) {
        // ✅ Load own profile from localStorage once
        setUser({
          id: currentUserId,
          username: currentUsername,
          full_name: currentFullName,
        });
      }else if (location.state?.user) {
          // ✅ Use user data passed via state (instant display)
          setUser(location.state.user);
      } 
    } catch (err) {
      console.error("Failed to load user profile:", err);
    }
  };

  fetchProfile();
  // ✅ Run only when username or logged-in user info changes
}, [username, currentUsername, currentUserId, currentFullName,location.state]);


  const handleMessageClick = async () => {
    if (!user) return;
    setLoading(true);
    console.log("user:", user);
    try {
      // Send POST request with user_id
      const response = await API.post(
        "/chat/dm",
        { user_id: user.id },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const chat = response.data;
      console.log("✅ Chat created or fetched:", chat);

      // Navigate to chat screen
      navigate(`/chats/chat/${chat.chat_id}`, { state: { chat } });
    } catch (error) {
      console.error("❌ Failed to start chat:", error);
      const msg =
        error.response?.data?.detail ||
        "Something went wrong starting the chat.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="pt-10 text-white text-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  const isOwnProfile = username === currentUsername;

  return (
    <div className="pt-10 flex flex-col items-center justify-center text-white space-y-8">
      <div className="flex flex-row items-center">
        <div className="w-40 h-40 rounded-full bg-white"></div>
        <div className="ml-8 space-y-2.5">
          <h1 className="text-3xl font-bold">{user.username}</h1>
          <p className="text-xl">{user.full_name}</p>
          <p>“It always seems impossible until it’s done.”</p>
        </div>
      </div>

      <div className="flex flex-row space-x-7">
        {/* ✅ Always show Edit Profile if it’s current user */}
        {isOwnProfile && (
          <button className="w-60 h-12 bg-neutral-800 rounded-2xl hover:bg-neutral-700">
            Edit Profile
          </button>
        )}

        {/* ✅ Always show Message button */}
        <button
          onClick={handleMessageClick}
          // disabled={isOwnProfile || loading} // disable if it's your own profile
          className={`w-60 h-12 rounded-2xl ${
            loading
              ? "bg-neutral-700 cursor-not-allowed"
              : "bg-neutral-800 hover:bg-neutral-700"
          }`}
        >
          {loading ? "Opening..." : "Message"}
        </button>
      </div>
    </div>
  );
}

export default Profile;
