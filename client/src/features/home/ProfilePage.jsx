import { useState } from "react";
import toast from "react-hot-toast";
import { LogOut, Globe, User, Phone, ChevronRight } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useUserStore } from "../../stores/userStore";
import api from "../../services/api";
import i18n from "../../i18n";

const LANGUAGES = [
  { value: "hi", label: "हिंदी", flag: "🇮🇳" },
  { value: "en", label: "English", flag: "🇬🇧" },
  { value: "mr", label: "मराठी", flag: "🇮🇳" },
  { value: "bn", label: "বাংলা", flag: "🇧🇩" },
  { value: "te", label: "తెలుగు", flag: "🇮🇳" },
];

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuthStore();
  const { language, setLanguage } = useUserStore();
  const [saving, setSaving] = useState(false);

  const handleLangChange = async (lang) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
    setSaving(true);
    try {
      await api.patch("/users/profile", { language: lang });
      updateUser({ language: lang });
      toast.success("भाषा बदल दी गई");
    } catch {
      toast.error("कुछ गलत हो गया");
    } finally {
      setSaving(false);
    }
  };

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "DS";

  return (
    <div className="px-4 py-5 space-y-5">
      <h2 className="font-headline text-lg font-bold text-gray-800">
        प्रोफ़ाइल
      </h2>

      {/* User info card */}
      <div className="card flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-2xl bg-tertiary-500 flex items-center
                        justify-center text-white font-headline font-bold text-lg"
        >
          {initials}
        </div>
        <div>
          <p className="font-semibold text-gray-800">{user?.name}</p>
          <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
            <Phone size={12} />
            <span>{user?.phone}</span>
          </div>
        </div>
      </div>

      {/* Language selector */}
      <div className="card space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Globe size={16} className="text-primary-500" />
          <p className="font-semibold text-sm text-gray-700">भाषा बदलें</p>
        </div>
        <div className="space-y-2">
          {LANGUAGES.map((l) => (
            <button
              key={l.value}
              onClick={() => handleLangChange(l.value)}
              disabled={saving}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl
                          border-2 transition-all text-sm font-medium
                          ${
                            language === l.value
                              ? "border-primary-500 bg-primary-50 text-primary-700"
                              : "border-gray-100 bg-white text-gray-700 hover:border-gray-200"
                          }`}
            >
              <div className="flex items-center gap-2">
                <span>{l.flag}</span>
                <span>{l.label}</span>
              </div>
              {language === l.value && (
                <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path
                      d="M1 4L3.5 6.5L9 1"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full flex items-center justify-center gap-2
                   py-3 rounded-2xl border-2 border-red-200 text-red-500
                   font-medium text-sm hover:bg-red-50 transition-colors"
      >
        <LogOut size={16} />
        लॉगआउट करें
      </button>

      <p className="text-center text-xs text-gray-400">
        Digital Saathi v1.0 · Made with ❤️ for India
      </p>
    </div>
  );
}
