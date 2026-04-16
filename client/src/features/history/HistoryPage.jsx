import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, MessageCircle, Search } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useChatStore } from "../../stores/chatStore";

function groupByDate(sessions, t) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yest = new Date(today);
  yest.setDate(yest.getDate() - 1);

  const groups = {};
  sessions.forEach((s) => {
    const d = new Date(s.updatedAt);
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    let label;
    if (day >= today) label = t("general.today", "आज");
    else if (day >= yest) label = t("general.yesterday", "कल");
    else {
      const diff = Math.floor((today - day) / 86400000);
      label = t("general.daysAgo", "{{count}} दिन पहले", { count: diff });
    }
    if (!groups[label]) groups[label] = [];
    groups[label].push(s);
  });
  return groups;
}

export default function HistoryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { sessions, fetchSessions, loadSession, deleteSession } =
    useChatStore();
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleLoad = async (id) => {
    await loadSession(id);
    navigate("/chat");
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    await deleteSession(id);
    toast.success(t("history.deleted", "बातचीत हटा दी गई"));
  };

  const filtered = sessions.filter(
    (s) => !query || s.title?.toLowerCase().includes(query.toLowerCase()),
  );

  const groups = groupByDate(filtered, t);

  return (
    <div className="px-4 py-5">
      {/* Header */}
      <h2 className="font-headline text-lg font-bold text-gray-800 mb-4">
        {t("history.title", "स्मृति (Memory)")}
      </h2>
      <p className="text-sm text-gray-500 -mt-3 mb-4">{t("history.subtitle", "आपकी पुरानी बातें")}</p>

      {/* Search */}
      <div className="relative mb-5">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          className="input-base pl-9"
          placeholder={t("history.searchPlaceholder", "खोजें...")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <MessageCircle size={40} className="text-gray-200 mb-3" />
          <p className="text-gray-500">{t("history.noChats", "अभी तक कोई बातचीत नहीं")}</p>
          <button
            onClick={() => navigate("/chat")}
            className="btn-primary mt-4 text-sm"
          >
            {t("history.startFirst", "पहली बातचीत शुरू करें")}
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(groups).map(([label, items]) => (
            <div key={label}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                {label}
              </p>
              <div className="space-y-2">
                {items.map((s) => {
                  const firstMsg =
                    s.messages?.[0]?.content?.slice(0, 60) || s.title;
                  const lang = s.messages?.[0]?.language || "hi";

                  return (
                    <div
                      key={s._id}
                      onClick={() => handleLoad(s._id)}
                      className="card-hover flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Initial circle */}
                        <div
                          className="w-9 h-9 rounded-xl bg-primary-500 flex items-center
                                        justify-center text-white font-bold text-sm flex-shrink-0"
                        >
                          {s.title?.[0]?.toUpperCase() || "F"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-gray-800 truncate">
                            {s.title}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5 truncate">
                            {firstMsg}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded uppercase">
                          {lang}
                        </span>
                        <button
                          onClick={(e) => handleDelete(e, s._id)}
                          className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
