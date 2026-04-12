import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useAuthStore } from "../../stores/authStore";

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();

  const [form, setForm] = useState({ phone: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form.phone, form.password);
    if (result.success) {
      toast.success("Welcome back!");
      navigate("/");
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="text-6xl mb-3">🪙</div>
        <h1 className="text-2xl font-bold text-primary-600">Digital Saathi</h1>
        <p className="text-gray-500 text-sm mt-1">{t("app.tagline")}</p>
      </div>

      {/* Card */}
      <div className="card w-full max-w-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">
          {t("auth.login")}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("auth.phone")}
            </label>
            <input
              type="tel"
              className="input-base"
              placeholder="9876543210"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("auth.password")}
            </label>
            <input
              type="password"
              className="input-base"
              placeholder="••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full mt-2"
          >
            {isLoading ? "Logging in..." : t("auth.login")}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          नया अकाउंट?{" "}
          <Link to="/register" className="text-primary-600 font-medium">
            {t("auth.register")}
          </Link>
        </p>
      </div>
    </div>
  );
}
