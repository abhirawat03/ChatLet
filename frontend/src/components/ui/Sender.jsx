import React from 'react'

function Sender({ message }) {
  return (
    <div className='flex flex-row items-end justify-end'>
      <div className='max-w-[45%] px-4 py-2 bg-blue-500 rounded-3xl mr-2' >
          <p className='break-words whitespace-normal'>{message.content}
          </p>
      </div>
    </div>
  )
}

export default Sender
