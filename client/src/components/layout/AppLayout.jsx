import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Home, MessageCircle, BarChart2, Clock, User } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import { useUserStore } from "../../stores/userStore";

export default function AppLayout() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { language, setLanguage } = useUserStore();

  const toggleLang = () => {
    const next = language === "hi" ? "en" : "hi";
    setLanguage(next);
    i18n.changeLanguage(next);
  };

  const navItems = [
    { to: "/", icon: Home, label: t("nav.home") },
    { to: "/chat", icon: MessageCircle, label: t("nav.chat") },
    { to: "/compare", icon: BarChart2, label: t("nav.compare") },
    { to: "/history", icon: Clock, label: t("nav.history") },
    { to: "/profile", icon: User, label: t("nav.profile") },
  ];

  return (
    <div className="min-h-screen bg-surface flex">
      {/* ── Desktop Sidebar ──────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-56 lg:w-64 bg-tertiary-500 min-h-screen sticky top-0 h-screen shrink-0 shadow-lg z-30">
        {/* Logo */}
        <div className="px-5 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center shadow-md">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 2L13 5V11L8 14L3 11V5L8 2Z"
                  fill="white"
                  fillOpacity="0.9"
                />
                <path
                  d="M8 5V11M5.5 6.5L8 5L10.5 6.5"
                  stroke="#1D9E75"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div>
              <span className="font-headline font-bold text-white text-base tracking-wide block">
                Digital Saathi
              </span>
              <span className="text-white/40 text-xs">आपका साथी</span>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium
                 ${
                   isActive
                     ? "bg-primary-500 text-white shadow-sm"
                     : "text-white/60 hover:text-white hover:bg-white/10"
                 }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Language toggle + user pill at bottom */}
        <div className="px-4 py-5 border-t border-white/10 space-y-3">
          {/* User pill */}
          {user && (
            <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl">
              <div className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {user.name?.[0]?.toUpperCase()}
              </div>
              <span className="text-white/70 text-sm truncate">
                {user.name}
              </span>
            </div>
          )}
          {/* Lang toggle */}
          <button
            onClick={toggleLang}
            className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20
                       text-white text-sm font-medium px-3 py-2 rounded-xl
                       transition-colors border border-white/10"
          >
            <span
              className={
                language === "hi" ? "text-primary-300 font-bold" : "opacity-60"
              }
            >
              हि
            </span>
            <span className="opacity-40 text-xs">|</span>
            <span
              className={
                language === "en" ? "text-primary-300 font-bold" : "opacity-60"
              }
            >
              EN
            </span>
          </button>
        </div>
      </aside>

      {/* ── Right side (mobile header + content + mobile nav) ────── */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* ── Mobile Top bar ───────────────────────────────────────── */}
        <header className="md:hidden bg-tertiary-500 px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary-500 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 2L13 5V11L8 14L3 11V5L8 2Z"
                  fill="white"
                  fillOpacity="0.9"
                />
                <path
                  d="M8 5V11M5.5 6.5L8 5L10.5 6.5"
                  stroke="#1D9E75"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="font-headline font-bold text-white text-base tracking-wide">
              Digital Saathi
            </span>
          </div>
          <button
            onClick={toggleLang}
            className="flex items-center gap-1 bg-white/10 hover:bg-white/20
                       text-white text-sm font-medium px-3 py-1 rounded-full
                       transition-colors border border-white/20"
          >
            <span
              className={
                language === "hi" ? "text-primary-300 font-bold" : "opacity-60"
              }
            >
              हि
            </span>
            <span className="opacity-40 text-xs">|</span>
            <span
              className={
                language === "en" ? "text-primary-300 font-bold" : "opacity-60"
              }
            >
              EN
            </span>
          </button>
        </header>

        {/* ── Page content ─────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto pb-nav md:pb-0 w-full max-w-3xl md:max-w-none mx-auto md:mx-0">
          <Outlet />
        </main>

        {/* ── Mobile Bottom navigation ──────────────────────────────── */}
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-20
                        bg-white border-t border-gray-100
                        flex justify-around items-center py-2
                        safe-area-pb shadow-[0_-4px_12px_rgba(0,0,0,0.06)]"
        >
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl
                 transition-colors min-w-[56px] ${
                   isActive
                     ? "text-primary-600"
                     : "text-gray-400 hover:text-gray-600"
                 }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`p-1.5 rounded-xl transition-colors ${isActive ? "bg-primary-500 text-white" : ""}`}
                  >
                    <Icon size={isActive ? 20 : 22} />
                  </div>
                  <span
                    className={`text-[10px] font-medium ${isActive ? "text-primary-600" : ""}`}
                  >
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
