import { useEffect, useRef, useState } from "react";
import { Send, Plus, Loader } from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useChatStore } from "../../stores/chatStore";
import { useAuthStore } from "../../stores/authStore";
import ReactMarkdown from "react-markdown";

function Message({ msg, isStreaming }) {
  const isUser = msg.role === "user";

  // Strip GLOSSARY_TERMS line from displayed content
  const cleanContent = msg.content
    ? msg.content.replace(/GLOSSARY_TERMS:.*/gi, "").trim()
    : "";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-1">
          🪙
        </div>
      )}
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? "bg-primary-500 text-white rounded-tr-sm"
            : "bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm"
        } ${isStreaming && !isUser ? "streaming-cursor" : ""}`}
      >
        {isUser ? (
          cleanContent
        ) : (
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              strong: ({ children }) => (
                <strong className="font-semibold">{children}</strong>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside space-y-1 my-2">
                  {children}
                </ol>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside space-y-1 my-2">
                  {children}
                </ul>
              ),
              li: ({ children }) => (
                <li className="leading-relaxed">{children}</li>
              ),
            }}
          >
            {cleanContent || (isStreaming ? "" : "...")}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { messages, isStreaming, sendMessage, startNewChat } = useChatStore();

  const [input, setInput] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || isStreaming) return;

    setInput("");
    inputRef.current?.focus();

    try {
      await sendMessage(msg, user?.language || "hi");
    } catch {
      toast.error(t("errors.generic"));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
        <div>
          <h2 className="font-semibold text-gray-800">Digital Saathi</h2>
          <p className="text-xs text-green-500">● Online</p>
        </div>
        <button
          onClick={startNewChat}
          className="btn-ghost flex items-center gap-1 text-sm"
        >
          <Plus size={16} />
          {t("chat.newChat")}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="text-5xl">🪙</div>
            <div>
              <p className="font-semibold text-gray-700">
                नमस्ते {user?.name}!
              </p>
              <p className="text-sm text-gray-500 mt-1">
                FD के बारे में कुछ भी पूछें
              </p>
            </div>
            {/* Suggestion chips */}
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {[
                "FD क्या होती है?",
                "सबसे अच्छा ब्याज कहाँ मिलता है?",
                "TDS क्या होता है?",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="text-xs bg-primary-50 text-primary-700 px-3 py-1.5 rounded-full border border-primary-100 hover:bg-primary-100 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <Message
            key={i}
            msg={msg}
            isStreaming={
              isStreaming &&
              i === messages.length - 1 &&
              msg.role === "assistant"
            }
          />
        ))}

        {/* Thinking indicator */}
        {isStreaming && messages[messages.length - 1]?.content === "" && (
          <div className="flex items-center gap-2 text-gray-400 text-sm px-2">
            <Loader size={14} className="animate-spin" />
            {t("chat.thinking")}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-white border-t border-gray-100">
        <div className="flex items-end gap-2 bg-gray-50 rounded-2xl px-4 py-2 border border-gray-200 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100 transition-all">
          <textarea
            ref={inputRef}
            rows={1}
            className="flex-1 bg-transparent text-sm resize-none outline-none py-1.5 max-h-24"
            placeholder={t("chat.placeholder")}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="btn-primary p-2 rounded-xl flex-shrink-0 disabled:opacity-40"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">
          Enter दबाएं भेजने के लिए
        </p>
      </div>
    </div>
  );
}
