import { NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home, MessageCircle, BarChart2, Clock, User } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";

export default function AppLayout() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);

  const navItems = [
    { to: "/", icon: Home, label: t("nav.home") },
    { to: "/chat", icon: MessageCircle, label: t("nav.chat") },
    { to: "/compare", icon: BarChart2, label: t("nav.compare") },
    { to: "/history", icon: Clock, label: t("nav.history") },
    { to: "/profile", icon: User, label: t("nav.profile") },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🪙</span>
          <span className="font-bold text-primary-600 text-lg">
            Digital Saathi
          </span>
        </div>
        <span className="text-sm text-gray-500">नमस्ते, {user?.name}</span>
      </header>

      {/* Page content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around py-2 z-10">
        {navItems.map(
          (
            { to, icon: Icon, label }, // eslint-disable-line no-unused-vars
          ) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
                  isActive
                    ? "text-primary-600"
                    : "text-gray-400 hover:text-gray-600"
                }`
              }
            >
              <Icon size={22} />
              <span className="text-xs">{label}</span>
            </NavLink>
          ),
        )}
      </nav>
    </div>
  );
}
