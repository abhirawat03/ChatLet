import { useRef, useEffect, useState } from 'react'
import Sender from './Sender'
import Receiver from './Receiver'
function MessageBox({ messages, currentUserId }) {

  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // ✅ Detect manual scroll up / down
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleScroll = () => {
      const atBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight < 50; // near bottom
      setAutoScroll(atBottom);
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ Auto scroll to bottom (only if user is at bottom)
  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "auto", block: "end" });
    }
  }, [messages, autoScroll]);


  if (!messages || messages.length === 0) {
    return (
      <div className="bg-[#1e1b1b] h-full overflow-y-auto p-4 flex items-center justify-center text-gray-400">
        <p>No Messages Yet</p>
      </div>
    );
  }
  // console.log("Rendering messages:", messages);
  // console.log('Rendering messages:', messages.map(m => m.id));

  return (
    <div
    ref={containerRef}
    className="bg-[#1e1b1b] h-full overflow-y-auto px-4 pt-4 flex flex-col space-y-1.5 scrollbar-hide">
        {messages.map((msg,index) =>{
        const key = msg.id ?? `temp-${index}`; // ✅ fallback key if id is missing
        return msg.sender_id === currentUserId ? (
          <Sender key={key} message={msg} />
        ) : (
          <Receiver key={key} message={msg} />
        ) 
    })}
      <div ref={bottomRef}></div>
    </div>
  )
}

export default MessageBox
