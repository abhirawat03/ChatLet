
import axios from "axios";
import { jwtDecode } from "jwt-decode";
const API_URL = import.meta.env.VITE_API_URL;
const API = axios.create({
  baseURL:`${API_URL}`,
  headers: { "Content-Type": "application/json" },
});

// --- Token helpers ---
function isTokenExpired(token, thresholdSeconds = 60) {
  if (!token) return true;
  try {
    const decoded = jwtDecode(token);
    const now = Date.now() / 1000;
    return decoded.exp - now < thresholdSeconds;
  } catch {
    return true;
  }
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) throw new Error("No refresh token available");

  try {
    const response = await axios.post(`${API_URL}/refresh`, {
      refresh_token: refreshToken,
    });
    const { access_token } = response.data;
    localStorage.setItem("access_token", access_token);
    return access_token;
  } catch (error) {
    console.error("❌ Failed to refresh token:", error);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/auth";
    throw error;
  }
}

// --- Unified interceptor ---
API.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem("access_token");

    if (token) {
      if (isTokenExpired(token)) {
        console.log("🔄 Token expired, refreshing...");
        token = await refreshAccessToken();
      }
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
