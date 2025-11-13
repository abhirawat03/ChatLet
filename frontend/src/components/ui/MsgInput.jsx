import React from 'react'
import { FaPlus } from "react-icons/fa6";
function MsgInput({ textValue, onChange, sendMessage }) {
  return (
    <div className='bg-[#1e1b1b] p-3.5 flex items-center'>
        <div className='text-white w-full px-10'>
          <div className=' border-gray-500 border px-5 rounded-full flex flex-row items-center justify-between'>
            <input 
            type="text" 
            name="search" 
            id="search" 
            placeholder='Type your message...' 
            value={textValue}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="w-[95%] h-10 text-white outline-none" />
            <FaPlus size={20}/>
          </div>
        </div>
    </div>
  )
}

export default MsgInput
