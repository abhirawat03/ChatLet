import {useEffect, useState} from 'react'
import ActiveUser from './ActiveUser'
import API from '../../api';
function Active() {
  const [activeUsers, setActiveUsers] = useState([]);

  useEffect(() => {
    async function loadActiveUsers() {
      try {
        const res = await API.get("/active-users");
        setActiveUsers(res.data);
      } catch (err) {
        console.error("Error fetching active users:", err);
      }
    }

    loadActiveUsers();
    const interval = setInterval(loadActiveUsers, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className='w-full pb-2 bg-[#110f0f] text-white flex flex-col space-y-2'>
      <h1 className='text-2xl font-medium ml-3'>Active Users</h1>
      <div className=' overflow-y-scroll h-28 scrollbar-hide space-x-3 flex flex-row px-3'>
        {activeUsers.length === 0 ? (
          <div className='flex justify-center items-center w-full'>
            <p className="text-gray-500 text-xl">No user is active now</p>
          </div>
        ) : (
          activeUsers.map((user) => (
            <ActiveUser key={user.id} user={user} />
          ))
        )}
        {/* <ActiveUser/>
        <ActiveUser/>
        <ActiveUser/>
        <ActiveUser/>
        <ActiveUser/> */}
        {/* <ActiveUser/>
        <ActiveUser/>
        <ActiveUser/>
        <ActiveUser/>
        <ActiveUser/>
        <ActiveUser/>
        <ActiveUser/>
        <ActiveUser/>
        <ActiveUser/> */}
      </div>
    </div>
  )
}

export default Active
