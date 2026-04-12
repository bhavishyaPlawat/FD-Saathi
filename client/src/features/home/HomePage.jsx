import { useNavigate } from "react-router-dom";
import {
  MessageCircle,
  BarChart2,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";

export default function HomePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const cards = [
    {
      icon: MessageCircle,
      title: "FD सवाल पूछें",
      desc: "कोई भी सवाल, हिंदी में जवाब",
      color: "bg-orange-50 text-orange-600",
      to: "/chat",
    },
    {
      icon: BarChart2,
      title: "दरें तुलना करें",
      desc: "सभी बैंकों की FD दरें एक जगह",
      color: "bg-blue-50 text-blue-600",
      to: "/compare",
    },
    {
      icon: ShieldCheck,
      title: "सुरक्षित निवेश",
      desc: "₹5 लाख तक DICGC बीमा",
      color: "bg-green-50 text-green-600",
      to: "/chat",
    },
    {
      icon: TrendingUp,
      title: "अधिक ब्याज",
      desc: "Small Finance Banks में 9%+",
      color: "bg-purple-50 text-purple-600",
      to: "/compare",
    },
  ];

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-5 text-white">
        <p className="text-sm opacity-80">नमस्ते 👋</p>
        <h1 className="text-xl font-bold mt-1">{user?.name}</h1>
        <p className="text-sm opacity-80 mt-1">
          आज FD के बारे में क्या जानना है?
        </p>
        <button
          onClick={() => navigate("/chat")}
          className="mt-4 bg-white text-primary-600 font-semibold text-sm px-4 py-2 rounded-xl"
        >
          सवाल पूछें →
        </button>
      </div>

      {/* Quick action cards */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 mb-3">
          क्या करना है?
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {cards.map(({ to, icon: Icon, title, desc, color }) => (
            <button
              key={title}
              onClick={() => navigate(to)}
              className="card text-left hover:shadow-md transition-shadow"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} mb-3`}
              >
                <Icon size={20} />
              </div>
              <p className="font-semibold text-sm text-gray-800">{title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Tip */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
        <p className="text-xs font-semibold text-amber-700 mb-1">
          💡 आज की टिप
        </p>
        <p className="text-sm text-amber-800">
          Senior citizens को FD पर 0.5% ज़्यादा ब्याज मिलता है। अपने माता-पिता
          के नाम पर FD करें!
        </p>
      </div>
    </div>
  );
}
