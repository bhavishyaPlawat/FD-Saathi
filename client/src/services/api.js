import axios from "axios";
import API_BASE_URL from "../config/apiBaseUrl";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global error handling
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Inside your api.js interceptor:
    if (err.response?.status === 401) {
      const token = localStorage.getItem("token");

      // 1. Clear standard token
      localStorage.removeItem("token");

      // 2. Clear Zustand's persisted auth state to ensure total consistency!
      localStorage.removeItem("auth-storage");

      const isAuthRoute =
        window.location.pathname === "/login" ||
        window.location.pathname === "/register";

      if (token && !isAuthRoute) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  },
);

export default api;
