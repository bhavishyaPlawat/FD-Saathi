import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useUserStore = create(
  persist(
    (set) => ({
      language: "hi",
      onboardingDone: false,

      setLanguage: (lang) => {
        localStorage.setItem("language", lang);
        set({ language: lang });
      },
      markOnboardingDone: () => set({ onboardingDone: true }),
    }),
    { name: "ds-user" },
  ),
);
