import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Eye, EyeOff, Phone, Lock } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [form, setForm] = useState({ phone: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form.phone, form.password);
    if (result.success) {
      toast.success("स्वागत है! 🙏");
      navigate("/");
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Hero top ──────────────────────────────────────── */}
      <div className="bg-tertiary-500 px-6 pt-14 pb-20 text-white text-center">
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

      {/* Card overlapping hero ──────────────────────────── */}
      <div className="flex-1 px-5 -mt-10">
        <div className="card shadow-lg">
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
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
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
              {isLoading ? "लॉगिन हो रहा है..." : t("auth.login")}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            नया अकाउंट?{" "}
            <Link to="/register" className="text-primary-600 font-semibold">
              {t("auth.register")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
