import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../../stores/authStore";

const LANGUAGES = [
  { value: "hi", label: "हिंदी" },
  { value: "en", label: "English" },
  { value: "mr", label: "मराठी" },
  { value: "bn", label: "বাংলা" },
  { value: "te", label: "తెలుగు" },
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
      toast.success("Account created!");
      navigate("/");
    } else {
      toast.error(result.message);
    }
  };

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex flex-col items-center justify-center px-6 py-10">
      <div className="mb-6 text-center">
        <div className="text-5xl mb-2">🪙</div>
        <h1 className="text-2xl font-bold text-primary-600">Digital Saathi</h1>
      </div>

      <div className="card w-full max-w-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">
          नया अकाउंट बनाएं
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              फ़ोन नंबर
            </label>
            <input
              type="tel"
              className="input-base"
              placeholder="9876543210"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              भाषा चुनें
            </label>
            <select
              className="input-base"
              value={form.language}
              onChange={(e) => set("language", e.target.value)}
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full mt-2"
          >
            {isLoading ? "Creating..." : "अकाउंट बनाएं"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          पहले से अकाउंट है?{" "}
          <Link to="/login" className="text-primary-600 font-medium">
            लॉगिन करें
          </Link>
        </p>
      </div>
    </div>
  );
}
