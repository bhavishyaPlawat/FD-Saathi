import { useState } from "react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../stores/authStore";
import api from "../../services/api";
import i18n from "../../i18n";

const LANGUAGES = [
  { value: "hi", label: "हिंदी" },
  { value: "en", label: "English" },
  { value: "mr", label: "मराठी" },
  { value: "bn", label: "বাংলা" },
  { value: "te", label: "తెలుగు" },
];

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuthStore();
  const [language, setLanguage] = useState(user?.language || "hi");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch("/users/profile", { language });
      updateUser({ language });
      i18n.changeLanguage(language);
      toast.success("प्रोफ़ाइल अपडेट हो गई");
    } catch {
      toast.error("कुछ गलत हो गया");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-4 py-6 space-y-4">
      <h2 className="text-lg font-bold text-gray-800">प्रोफ़ाइल</h2>

      {/* User info */}
      <div className="card flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center text-2xl">
          👤
        </div>
        <div>
          <p className="font-semibold text-gray-800">{user?.name}</p>
          <p className="text-sm text-gray-500">{user?.phone}</p>
        </div>
      </div>

      {/* Language */}
      <div className="card space-y-3">
        <p className="font-semibold text-sm text-gray-700">भाषा बदलें</p>
        <div className="grid grid-cols-2 gap-2">
          {LANGUAGES.map((l) => (
            <button
              key={l.value}
              onClick={() => setLanguage(l.value)}
              className={`py-2 px-4 rounded-xl text-sm font-medium border transition-colors ${
                language === l.value
                  ? "bg-primary-500 text-white border-primary-500"
                  : "bg-white text-gray-600 border-gray-200 hover:border-primary-300"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary w-full text-sm"
        >
          {saving ? "Saving..." : "सेव करें"}
        </button>
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full py-3 rounded-xl border border-red-200 text-red-500 font-medium text-sm hover:bg-red-50 transition-colors"
      >
        लॉगआउट करें
      </button>

      <p className="text-center text-xs text-gray-400">Digital Saathi v1.0</p>
    </div>
  );
}
