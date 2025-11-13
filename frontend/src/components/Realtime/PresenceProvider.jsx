import { useEffect } from "react";

export default function PresenceProvider({ children }) {
  useEffect(() => {
  const token = localStorage.getItem("access_token");
  if (!token) return;
  const API_URL = import.meta.env.VITE_API_URL.replace("http://", "");;
  const ws = new WebSocket(`ws://${API_URL}/ws/online?token=${token}`);

  ws.onopen = () => console.log("✅ Connected to /ws/online");
  ws.onclose = (e) => console.log("❌ Closed:", e.code, e.reason);
  ws.onerror = (e) => console.error("⚠️ Error:", e);

  const interval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) ws.send("ping");
  }, 20000);

  // Only close if actually connected
  return () => {
    clearInterval(interval);
    if (ws.readyState === WebSocket.OPEN) {
      ws.close(1000, "Component unmounted");
    }
  };
}, []);


  return children;
}
