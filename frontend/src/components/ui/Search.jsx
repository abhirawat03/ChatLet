import {useRef, useState, useEffect} from 'react'
import { BsSearch } from "react-icons/bs";
// import axios from "axios";
import { useNavigate } from 'react-router-dom';
import API from '../../api';
function Search() {
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const handleClick = (user) => {
    // Navigate to profile and send user data
    navigate(`/search/profile/${user.username}`, { state: { user } });
  };
  useEffect(() => {
    const handleWindow = () => {
      // Prevent losing the focus state when switching tabs
      if (document.activeElement === inputRef.current) {
        setIsFocused(true);
      }
    };

    window.addEventListener("blur", handleWindow);
    window.addEventListener("focus", handleWindow);

    return () => {
      window.removeEventListener("blur", handleWindow);
      window.removeEventListener("focus", handleWindow);
    };
  }, []);
  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      return;
    }
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/users/search?q=${query}`);
        console.log(res.data);
        setResults(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUsers();
  },[query])
  return (
    // <div className='w-70 h-full rounded-tl-2xl bg-[#110f0f] border-t-neutral-700 border-t border-r-neutral-700 border-r border-l-neutral-700 border-l flex flex-col items-center p-5 gap-4 '>
    <div className='h-full bg-[#110f0f] border-r-neutral-700 border-r border-l-neutral-700 flex flex-col items-center p-5 gap-4 '>
      <div className='
      w-full h-12 flex border-neutral-600 border rounded-full px-4 items-center gap-2 transition-all duration-0 ease-in-out'
      onClick={() => inputRef.current?.focus()}
      >
        {!isFocused && (  
        <BsSearch size={20} className='text-white'/>
         )

        }
        <input 
        type="text"
        placeholder='Search User' 
        className='text-white flex-1 h-8 outline-none'
        value={query}
        onFocus={()=>setIsFocused(true)}
        onBlur={(e) => {
           if (!document.hidden && !e.relatedTarget) {
              setIsFocused(false);
            }
          }}
        onChange={(e) => setQuery(e.target.value)}
        ref={inputRef}
        />
      </div>
      <div className='flex flex-1 flex-col w-full'>
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : query.length === 0 ? (
          <p className="text-gray-400 ">Start typing to search users...</p>
        ) : results.length === 0 ? (
          <p className="text-gray-400">No users found.</p>
        ) :
        (
          <ul className='space-y-3 w-full'>
            {results.map((user) => (
              <li 
              key={user.username}
              onClick={() => handleClick(user)}
              className='border border-neutral-600 px-4 py-1 rounded-full text-white text-2xl flex flex-row items-center space-x-4 w-full cursor-pointer hover:bg-neutral-800'>
                <div className="w-8 h-8 rounded-full bg-white"></div>
                <div className='flex flex-col'>
                  <h1 className='text-base font-medium'>{user.full_name}</h1>
                  <p className='text-sm font-mono'>{user.username}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default Search
