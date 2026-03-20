import axios from "axios";

// Using VITE_ prefixes so Vite exposes these to import.meta.env
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export const UPLOADS_URL = import.meta.env.VITE_UPLOADS_URL || "http://localhost:5000/uploads";

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // Slightly longer for file uploads
});

// Response interceptor — auto handle 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("agritoak-auth");
      // Don't auto-redirect if we are already on login or register
      if (!["/login", "/register", "/"].includes(window.location.pathname)) {
         window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;