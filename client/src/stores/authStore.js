import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../services/api";
import i18n from "../i18n";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (phone, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post("/auth/login", { phone, password });
          const { user, token } = data.data;
          localStorage.setItem("token", token);
          i18n.changeLanguage(user.language);
          set({ user, token, isLoading: false });
          return { success: true };
        } catch (err) {
          set({ isLoading: false });
          return {
            success: false,
            message: err.response?.data?.message || "Login failed",
          };
        }
      },

      register: async (payload) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post("/auth/register", payload);
          const { user, token } = data.data;
          localStorage.setItem("token", token);
          i18n.changeLanguage(user.language);
          set({ user, token, isLoading: false });
          return { success: true };
        } catch (err) {
          set({ isLoading: false });
          return {
            success: false,
            message: err.response?.data?.message || "Registration failed",
          };
        }
      },

      logout: () => {
        localStorage.removeItem("token");
        set({ user: null, token: null });
      },

      updateUser: (updates) =>
        set((state) => ({ user: { ...state.user, ...updates } })),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user, token: state.token }),
    },
  ),
);
