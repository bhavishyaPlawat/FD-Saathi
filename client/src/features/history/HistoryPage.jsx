import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useChatStore } from "../../stores/chatStore";

export default function HistoryPage() {
  const navigate = useNavigate();
  const { sessions, fetchSessions, loadSession, deleteSession } =
    useChatStore();

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
    toast.success("बातचीत हटा दी गई");
  };

  return (
    <div className="px-4 py-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4">पुरानी बातचीत</h2>

      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <MessageCircle size={40} className="text-gray-300 mb-3" />
          <p className="text-gray-500">अभी तक कोई बातचीत नहीं</p>
          <button
            onClick={() => navigate("/chat")}
            className="btn-primary mt-4 text-sm"
          >
            पहली बातचीत शुरू करें
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <div
              key={s._id}
              onClick={() => handleLoad(s._id)}
              className="card flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={18} className="text-primary-500" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm text-gray-800 truncate">
                    {s.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {s.messages?.length || 0} messages •{" "}
                    {new Date(s.updatedAt).toLocaleDateString("hi-IN")}
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => handleDelete(e, s._id)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors ml-2"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
