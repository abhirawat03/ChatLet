import {useEffect, useState} from 'react'
import API from '../../api';
import { Link, useNavigate } from 'react-router-dom'
function Signup() {
    const [form, setForm] = useState({
        full_name: "",
        username: "",
        email: "",
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

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await API.post("/register", form);

      // Auto login
      localStorage.setItem("access_token", res.data.access_token);
      localStorage.setItem("refresh_token", res.data.refresh_token);

      navigate("/chats");
    } catch (err) {
      setError(err.response?.data?.detail || "Signup failed");
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
        <form   
        onSubmit={handleSignup} 
        className="flex flex-col gap-2 w-64 ">
            <input
            type="text"
            id="full_name"
            name="full_name"
            placeholder="Full Name"
            value={form.full_name}
            onChange={handleChange}
            className="border border-neutral-600 rounded p-2 outline-none"
            required
          />
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="border border-neutral-600 rounded p-2 outline-none"
            required
          />
          <input
            type="text"
            id="email"
            name="email"
            placeholder="Email"
            value={form.email}
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
            Signup
          </button>
        </form>
        <div className="border-t border-neutral-600 mt-5 w-full"></div>
        <div className="text-sm mt-3 flex gap-2 justify-center">
          <p>Already have a account?</p>
          <Link to='/auth' className="text-blue-700 cursor-pointer hover:text-blue-600">Log in</Link>
        </div>
      </div>
  )
}

export default Signup   