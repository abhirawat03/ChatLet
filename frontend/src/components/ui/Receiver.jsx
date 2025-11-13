import React from 'react'

function Receiver({message}) {
  return ( 
      <div className='flex flex-row items-end'>
        <div className='w-7 h-7 rounded-full bg-white flex'></div>
        <div className='max-w-[45%] px-4 py-2 bg-gray-600 rounded-3xl ml-2' >
          <p className='break-words whitespace-normal'>{message.content}
          </p>
        </div>
    </div>
  )
}

export default Receiver
