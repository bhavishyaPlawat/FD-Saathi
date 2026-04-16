import { useNavigate } from "react-router-dom";
import {
  MessageCircle,
  BarChart2,
  HelpCircle,
  BookOpen,
  Lightbulb,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../stores/authStore";
import { useEffect, useState } from "react";
import api from "../../services/api";
import STTButton from "../../components/voice/STTButton";

// Horizontal rate ticker
function RateTicker({ rates }) {
  if (!rates.length) return null;
  const doubled = [...rates, ...rates];
  return (
    <div className="overflow-hidden bg-white/10 rounded-xl py-2 px-3">
      <div className="ticker-inner">
        {doubled.map((r, i) => (
          <span
            key={i}
            className="flex items-center gap-2 text-white text-sm whitespace-nowrap"
          >
            <span className="font-medium opacity-80">{r.bankName}</span>
            <span className="text-xs opacity-60">{r.tenorMonths}M</span>
            <span className="text-primary-300 font-bold">{r.rateGeneral}%</span>
            <span className="w-1 h-1 rounded-full bg-white/30 mx-2" />
          </span>
        ))}
      </div>
    </div>
  );
}

const QUICK_ACTIONS = [
  {
    icon: HelpCircle,
    titleKey: "home.quick.q1.title",
    defaultTitle: "FD क्या है?",
    descKey: "home.quick.q1.desc",
    defaultDesc: "बेसिक जानकारी",
    msg: "FD क्या होती है सरल भाषा में समझाओ",
    to: "/chat",
  },
  {
    icon: BarChart2,
    titleKey: "home.quick.q2.title",
    defaultTitle: "ब्याज कैसे मिलता है?",
    descKey: "home.quick.q2.desc",
    defaultDesc: "ब्याज की गणना",
    msg: "FD पर ब्याज कैसे calculate होता है",
    to: "/chat",
  },
  {
    icon: MessageCircle,
    titleKey: "home.quick.q3.title",
    defaultTitle: "कौन सा बैंक?",
    descKey: "home.quick.q3.desc",
    defaultDesc: "बैंक तुलना",
    msg: null,
    to: "/compare",
  },
  {
    icon: BookOpen,
    titleKey: "home.quick.q4.title",
    defaultTitle: "कैसे बुक करें?",
    descKey: "home.quick.q4.desc",
    defaultDesc: "FD खोलने की प्रक्रिया",
    msg: "FD कैसे खोलें step by step बताओ",
    to: "/chat",
  },
];

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [featuredRates, setFeaturedRates] = useState([]);

  useEffect(() => {
    api
      .get("/fd/featured")
      .then((r) => setFeaturedRates(r.data.data || []))
      .catch(() => {});
  }, []);

  const goChat = (msg) => {
    if (msg) sessionStorage.setItem("ds_prefill", msg);
    navigate("/chat");
  };

  const handleVoiceSearch = (transcribedText) => {
    goChat(transcribedText); // Immediately navigate to chat with transcribed text
  };

  return (
    <div className="flex flex-col min-h-full">
      <div className="bg-tertiary-500 px-4 md:px-8 pt-5 md:pt-8 pb-6 md:pb-8">
        <p className="text-white/70 text-sm">{t("home.greeting", "नमस्ते 👋")}</p>
        <h1 className="font-headline text-xl md:text-2xl font-bold text-white mt-0.5">
          {user?.name}
        </h1>
        <p className="text-white/60 text-xs mt-0.5">{t("home.subtitle", "आज कौन सी FD समझनी है?")}</p>
        <div className="mt-4 max-w-lg"><RateTicker rates={featuredRates} /></div>
      </div>

      <div className="px-4 md:px-8 py-5 md:py-6 space-y-5 md:space-y-6 max-w-5xl">
        {/* Quick chat bar with Voice Mic */}
        <div className="card flex items-center gap-3 hover:shadow-md transition-shadow relative">
          <div onClick={() => navigate("/chat")} className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 cursor-pointer">
            <MessageCircle size={16} className="text-primary-600" />
          </div>
          <span onClick={() => navigate("/chat")} className="text-sm text-gray-400 flex-1 cursor-pointer">
            {t("home.askPlaceholder", "FD के बारे में पूछें...")}
          </span>
          
          {/* VOICE STT BUTTON ADDED HERE */}
          <STTButton onTextResult={handleVoiceSearch} className="mx-2" />

          <div onClick={() => navigate("/chat")} className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center cursor-pointer">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7H12M8 3L12 7L8 11" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            {t("home.quickLabel", "फटाफट सवाल पूछें")}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {QUICK_ACTIONS.map(({ icon: Icon, titleKey, defaultTitle, descKey, defaultDesc, msg, to }) => (
              <button key={titleKey} onClick={() => (msg ? goChat(msg) : navigate(to))} className="card-hover text-left">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center mb-3">
                  <Icon size={20} className="text-primary-600" />
                </div>
                <p className="font-semibold text-sm text-gray-800 leading-tight">{t(titleKey, defaultTitle)}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t(descKey, defaultDesc)}</p>
              </button>
            ))}
          </div>
        </div>

        {/* ── Two-column on desktop: advice + stats ─────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Saathi advice card */}
          <div className="saathi-advice">
            <div className="w-8 h-8 rounded-full bg-secondary-200 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Lightbulb size={16} className="text-secondary-700" />
            </div>
            <div>
              <p className="text-xs font-bold text-secondary-700 mb-1 uppercase tracking-wide">
                {t("home.adviceTitle", "साथी की सलाह")}
              </p>
              <p className="text-sm text-secondary-800 leading-relaxed">
                {t("home.adviceDesc", "बचत खाते में पैसा रखने के बजाय, 1 साल की FD में 7.5% तक ब्याज कमाएं।")}
              </p>
            </div>
          </div>

          {/* Quick stats card */}
          <div className="card bg-primary-50 border-primary-100">
            <p className="text-xs font-bold text-primary-700 mb-3 uppercase tracking-wide">
              {t("home.todayRates", "आज की दरें")}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "SBI 1Y", rate: "6.80%" },
                { label: "HDFC 1Y", rate: "7.00%" },
                { label: "Unity SF 1Y", rate: "9.00%" },
                { label: "Senior +", rate: "+0.50%" },
              ].map(({ label, rate }) => (
                <div
                  key={label}
                  className="bg-white rounded-xl p-2 text-center shadow-sm"
                >
                  <p className="text-[10px] text-gray-500 truncate">{label}</p>
                  <p className="font-bold text-primary-600 text-sm">{rate}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
