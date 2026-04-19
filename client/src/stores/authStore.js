import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../services/api";
import i18n from "../i18n";
import { useUserStore } from "./userStore";

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
          useUserStore.getState().setLanguage(user.language);
          set({ user, token, isLoading: false });
          return { success: true };
        } catch (err) {
          set({ isLoading: false });
          console.log("[v0] Login error response:", err.response?.status, err.response?.data);
          
          // Handle different error types
          const statusCode = err.response?.status;
          const errorData = err.response?.data;
          
          // 401 = Invalid credentials (already handled by interceptor)
          // 422 = Validation error (malformed request)
          // 500 = Server error
          
          return {
            success: false,
            message: errorData?.message || "Login failed",
            fieldErrors: errorData?.errors || null,
            statusCode: statusCode,
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
          useUserStore.getState().setLanguage(user.language);
          set({ user, token, isLoading: false });
          return { success: true };
        } catch (err) {
          set({ isLoading: false });
          return {
            success: false,
            message: err.response?.data?.message || "Registration failed",
            fieldErrors: err.response?.data?.errors || null,
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
