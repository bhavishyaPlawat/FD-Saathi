import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../../stores/authStore";

const LANGUAGES = [
  { value: "hi", label: "हिंदी", native: "Hindi", flag: "🇮🇳" },
  { value: "en", label: "English", native: "English", flag: "🇬🇧" },
  { value: "mr", label: "मराठी", native: "Marathi", flag: "🇮🇳" },
  { value: "bn", label: "বাংলা", native: "Bengali", flag: "🇧🇩" },
  { value: "te", label: "తెలుగు", native: "Telugu", flag: "🇮🇳" },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    password: "",
    language: "hi",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(form);
    if (result.success) {
      toast.success("अकाउंट बन गया! 🎉");
      navigate("/");
    } else {
      toast.error(result.message);
    }
  };

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row">
      {/* ── Desktop left panel ─────────────────────────────────── */}
      <div className="hidden md:flex md:w-2/5 bg-tertiary-500 flex-col items-center justify-center px-10 py-16 text-white">
        <div className="w-20 h-20 rounded-3xl bg-primary-500 flex items-center justify-center mb-6 shadow-xl">
          <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
            <path
              d="M16 4L26 10V22L16 28L6 22V10L16 4Z"
              fill="white"
              fillOpacity="0.9"
            />
            <path
              d="M16 10V22M11 13L16 10L21 13"
              stroke="#1D9E75"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <h1 className="font-headline text-3xl font-bold mb-2">
          Digital Saathi
        </h1>
        <p className="text-white/60 text-center text-sm max-w-xs">
          अपना मुफ़्त अकाउंट बनाएं और FD की दुनिया को समझें
        </p>

        <div className="mt-10 space-y-3 w-full max-w-xs">
          {[
            { emoji: "🌐", text: "5 भाषाओं में सपोर्ट" },
            { emoji: "🔒", text: "आपका डेटा सुरक्षित है" },
            { emoji: "💰", text: "बेस्ट FD रेट खोजें" },
          ].map(({ emoji, text }) => (
            <div
              key={text}
              className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3"
            >
              <span className="text-xl">{emoji}</span>
              <span className="text-sm text-white/80">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right / Mobile: form ───────────────────────────────── */}
      <div className="flex-1 flex flex-col">
        {/* Mobile hero */}
        <div className="md:hidden bg-tertiary-500 px-6 pt-14 pb-20 text-white text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary-500 flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path
                d="M16 4L26 10V22L16 28L6 22V10L16 4Z"
                fill="white"
                fillOpacity="0.9"
              />
              <path
                d="M16 10V22M11 13L16 10L21 13"
                stroke="#1D9E75"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h1 className="font-headline text-2xl font-bold">Digital Saathi</h1>
          <p className="text-white/70 text-sm mt-1">
            अपनी भाषा चुनें · We'll talk in your language
          </p>
        </div>

        {/* Scrollable form */}
        <div className="flex-1 flex items-start md:items-center justify-center px-5 md:px-10 py-0 md:py-8">
          <div className="w-full max-w-sm -mt-10 md:mt-0 pb-10 md:pb-0">
            <div className="card shadow-lg md:shadow-xl">
              <h2 className="font-headline text-lg font-bold text-gray-800 mb-5">
                नया अकाउंट बनाएं
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    नाम
                  </label>
                  <input
                    type="text"
                    className="input-base"
                    placeholder="आपका नाम"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    फ़ोन नंबर
                  </label>
                  <input
                    type="tel"
                    className="input-base"
                    placeholder="9876543210"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    required
                    inputMode="numeric"
                    maxLength={10}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    पासवर्ड
                  </label>
                  <input
                    type="password"
                    className="input-base"
                    placeholder="कम से कम 6 अक्षर"
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                    required
                  />
                </div>

                {/* Language picker */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    अपनी भाषा चुनें
                  </label>
                  <div className="space-y-2">
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.value}
                        type="button"
                        onClick={() => set("language", l.value)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl
                                    border-2 transition-all text-sm font-medium
                                    ${
                                      form.language === l.value
                                        ? "border-primary-500 bg-primary-50 text-primary-700"
                                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                                    }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{l.flag}</span>
                          <span>{l.label}</span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {l.native}
                        </span>
                        {form.language === l.value && (
                          <span className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center ml-2">
                            <svg
                              width="10"
                              height="8"
                              viewBox="0 0 10 8"
                              fill="none"
                            >
                              <path
                                d="M1 4L3.5 6.5L9 1"
                                stroke="white"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                              />
                            </svg>
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full mt-2"
                >
                  {isLoading ? "बन रहा है..." : "आगे बढ़ें →"}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-5">
                पहले से अकाउंट है?{" "}
                <Link to="/login" className="text-primary-600 font-semibold">
                  लॉगिन करें
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
