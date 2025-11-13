
import React, { useState,  useEffect } from "react";
import API from "../../api";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  // const [username, setUsername] = useState("");
  // const [password, setPassword] = useState("");
  const [form, setForm] = useState({
        username: "",
        password: "",
    });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const formData = new URLSearchParams();
      formData.append("username", form.username);
      formData.append("password", form.password);
    // Send as form-encoded data
    const res = await API.post("/login", formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const { access_token, refresh_token } = res.data;
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);
    // ✅ Save username (this is critical for your Chat display)
    localStorage.setItem("username", form.username);
    // ✅ (Optional) Fetch user info (to get ID/full name)
    try {
      const me = await API.get("/users/me");
      localStorage.setItem("user_id", me.data.id);
      localStorage.setItem("full_name", me.data.full_name || "");
    } catch (fetchErr) {
      console.warn("Failed to fetch user info:", fetchErr);
    }

    navigate("/chats")
  } catch (err) {
    console.error("Login error:",err);
    setError(err.response?.data?.detail || "Invalid username or password");
  }
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      navigate("/chats", { replace: true }); // auto-redirect if already logged in
    }
  }, [navigate]);

  return (
      <div>
        <form onSubmit={handleLogin} className="flex flex-col gap-2 w-64 ">
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Username or Email"
            value={form.username}
            onChange={handleChange}
            className="border border-neutral-600 rounded p-2 outline-none"
            required
          />
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="border border-neutral-600 rounded p-2 outline-none"
            required
          />
          {error && <div className="text-red-500">{error}</div>}
          <button
            type="submit"
            className="bg-blue-800 text-white p-2 rounded mt-2 font-semibold cursor-pointer hover:bg-blue-700"
          >
            Log in
          </button>
        </form>
        <div className="border-t border-neutral-600 mt-5 w-full"></div>
        <div className="text-sm mt-3 flex gap-2 justify-center">
          <p>Don't have an account?</p>
          <Link to='/auth/signup' className="text-blue-700 cursor-pointer hover:text-blue-600">Sign up</Link>
        </div>
      </div>
  );
}
