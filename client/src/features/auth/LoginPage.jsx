import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Eye, EyeOff, Phone, Lock, Languages } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [form, setForm] = useState({ phone: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form.phone, form.password);
    if (result.success) {
      toast.success(t("auth.loginSuccess", "स्वागत है! 🙏"));
      navigate("/");
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row relative">
      {/* ── Floating Language Toggle ── */}
      <button 
        onClick={() => i18n.changeLanguage(i18n.language === "en" ? "hi" : "en")}
        className="absolute top-4 right-4 md:right-8 bg-white/50 backdrop-blur-md md:bg-white border border-gray-200 md:shadow-md px-3 py-1.5 rounded-full flex items-center gap-2 text-sm font-semibold text-gray-700 z-10 hover:bg-white transition-colors"
      >
        <Languages size={16} className="text-primary-600" />
        {i18n.language === "en" ? "हिंदी" : "English"}
      </button>

      {/* ── Desktop left panel (hero) ──────────────────────────── */}
      <div className="hidden md:flex md:w-1/2 lg:w-2/5 bg-tertiary-500 flex-col items-center justify-center px-10 py-16 text-white">
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
        <p className="text-white/60 text-center text-sm max-w-xs leading-relaxed">
          {t("app.tagline")} — {t("auth.loginSubtitle", "FD की जानकारी, अपनी भाषा में")}
        </p>

        <div className="mt-10 space-y-3 w-full max-w-xs">
          {[
            { emoji: "📊", text: t("auth.features.compare", "सभी बैंकों की FD दरें एक जगह") },
            { emoji: "🤖", text: t("auth.features.ai", "AI साथी से कभी भी पूछें") },
            { emoji: "🇮🇳", text: t("auth.features.support", "5 भाषाओं में उपलब्ध") },
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
        {/* Mobile hero top */}
        <div className="md:hidden bg-tertiary-500 px-6 pt-14 pb-20 text-white text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
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
          <h1 className="font-headline text-2xl font-bold mb-1">
            Digital Saathi
          </h1>
          <p className="text-white/70 text-sm">{t("app.tagline")}</p>
        </div>

        {/* Card */}
        <div className="flex-1 flex items-start md:items-center justify-center px-5 md:px-10">
          <div className="w-full max-w-sm -mt-10 md:mt-0">
            <div className="card shadow-lg md:shadow-xl">
              <h2 className="font-headline text-lg font-bold text-gray-800 mb-5">
                {t("auth.login")}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    {t("auth.phone")}
                  </label>
                  <div className="relative">
                    <Phone
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="tel"
                      className="input-base pl-9"
                      placeholder="9876543210"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      required
                      inputMode="numeric"
                      maxLength={10}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    {t("auth.password")}
                  </label>
                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type={showPwd ? "text" : "password"}
                      className="input-base pl-9 pr-10"
                      placeholder="••••••"
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full mt-2"
                >
                  {isLoading ? t("auth.loggingIn", "लॉगिन हो रहा है...") : t("auth.login")}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-5">
                {t("auth.newAccount", "नया अकाउंट?")}{" "}
                <Link to="/register" className="text-primary-600 font-semibold">
                  {t("auth.register")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
