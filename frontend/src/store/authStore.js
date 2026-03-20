import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../utils/api.js";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,
      error: null,

      register: async (data) => {
        set({ loading: true, error: null });
        try {
          const res = await api.post("/auth/register", data);
          set({ user: res.data.user, token: res.data.token, loading: false });
          api.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
          return { success: true };
        } catch (err) {
          const msg = err.response?.data?.message || "Registration failed";
          set({ error: msg, loading: false });
          return { success: false, message: msg };
        }
      },

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const res = await api.post("/auth/login", { email, password });
          set({ user: res.data.user, token: res.data.token, loading: false });
          api.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
          return { success: true, role: res.data.user.role };
        } catch (err) {
          const msg = err.response?.data?.message || "Login failed";
          set({ error: msg, loading: false });
          return { success: false, message: msg };
        }
      },

      logout: () => {
        set({ user: null, token: null });
        delete api.defaults.headers.common["Authorization"];
      },

      initAuth: () => {
        const { token } = get();
        if (token) {
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }
      },
    }),
    { name: "agritoak-auth", partialize: (s) => ({ user: s.user, token: s.token }) }
  )
);

export default useAuthStore;