import { useEffect, useRef, useState } from "react";
import { Send, Plus, Mic, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useChatStore } from "../../stores/chatStore";
import { useAuthStore } from "../../stores/authStore";
import ReactMarkdown from "react-markdown";

// ── Glossary card (shown when AI detects FD jargon) ─────────────
function GlossaryCard({ terms }) {
  if (!terms?.length) return null;
  return (
    <div className="mx-4 mb-3 bg-primary-50 border border-primary-100 rounded-2xl p-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-5 h-5 rounded bg-primary-500 flex items-center justify-center">
          <span className="text-white text-[10px] font-bold">📖</span>
        </div>
        <p className="text-xs font-bold text-primary-700 uppercase tracking-wide">
          Financial Glossary
        </p>
      </div>
      <div className="flex flex-wrap gap-1 mt-1">
        {terms.map((t) => (
          <span
            key={t}
            className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Single message bubble ──────────────────────────────────────
function Message({ msg, isStreaming }) {
  const isUser = msg.role === "user";
  const clean = (msg.content || "").replace(/GLOSSARY_TERMS:.*/gi, "").trim();

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3 px-4`}
    >
      {!isUser && (
        <div
          className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center
                        text-white text-xs font-bold mr-2 flex-shrink-0 mt-1 shadow-sm"
        >
          DS
        </div>
      )}
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed
        ${
          isUser
            ? "bg-tertiary-500 text-white rounded-tr-sm"
            : `bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm
             ${isStreaming ? "streaming-cursor" : ""}`
        }`}
      >
        {isUser ? (
          clean
        ) : (
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              strong: ({ children }) => (
                <strong className="font-semibold text-gray-900">
                  {children}
                </strong>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside space-y-1 my-2">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside space-y-1 my-2">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="leading-relaxed">{children}</li>
              ),
            }}
          >
            {clean || (isStreaming ? "" : "...")}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}

// ── Suggested chips ────────────────────────────────────────────
const SUGGESTIONS = [
  "FD क्या है?",
  "सबसे अच्छी FD कहाँ है?",
  "TDS क्या होता है?",
  "Senior citizen को क्या फायदा है?",
  "FD कैसे खुलती है?",
];

export default function ChatPage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { messages, isStreaming, sendMessage, startNewChat, activeSession } =
    useChatStore();

  const [input, setInput] = useState("");
  const [lastGlossary, setLastGlossary] = useState([]);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Pre-fill from HomePage quick action
  useEffect(() => {
    const prefill = sessionStorage.getItem("ds_prefill");
    if (prefill) {
      setInput(prefill);
      sessionStorage.removeItem("ds_prefill");
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Track glossary terms from last AI message
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (last?.role === "assistant" && last.glossaryTerms?.length) {
      setLastGlossary(last.glossaryTerms);
    }
  }, [messages]);

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || isStreaming) return;
    setInput("");
    setLastGlossary([]);
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
    <div className="flex flex-col h-[calc(100vh-7.5rem)]">
      {/* ── Chat header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold">
            DS
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">FD Saathi</p>
            <p className="text-xs text-primary-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse inline-block" />
              हमेशा उपलब्ध
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            startNewChat();
            setLastGlossary([]);
          }}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary-600
                     bg-gray-100 hover:bg-primary-50 px-3 py-1.5 rounded-full transition-colors"
        >
          <Plus size={13} />
          {t("chat.newChat")}
        </button>
      </div>

      {/* ── Messages ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto py-4 space-y-1 bg-surface">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-6 space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-primary-500 flex items-center justify-center shadow-lg">
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
            <div>
              <p className="font-headline font-bold text-gray-800 text-lg">
                नमस्ते, {user?.name}!
              </p>
              <p className="text-sm text-gray-500 mt-1">
                FD के बारे में कुछ भी पूछें
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTIONS.map((q) => (
                <button key={q} onClick={() => setInput(q)} className="chip">
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

        {/* Glossary card after last AI message */}
        {!isStreaming && <GlossaryCard terms={lastGlossary} />}

        {/* Thinking indicator */}
        {isStreaming && messages[messages.length - 1]?.content === "" && (
          <div className="flex items-center gap-2 px-6 text-gray-400 text-sm">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-gray-300 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            {t("chat.thinking")}
          </div>
        )}

        {/* Suggested chips after conversation starts */}
        {messages.length > 0 && !isStreaming && (
          <div className="flex gap-2 px-4 overflow-x-auto pb-2 mt-2">
            {SUGGESTIONS.slice(0, 3).map((q) => (
              <button
                key={q}
                onClick={() => setInput(q)}
                className="chip flex-shrink-0"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ────────────────────────────────────────── */}
      <div className="px-4 py-3 bg-white border-t border-gray-100">
        <div
          className="flex items-end gap-2 bg-gray-50 rounded-2xl px-3 py-2
                        border border-gray-200 focus-within:border-primary-400
                        focus-within:ring-2 focus-within:ring-primary-100 transition-all"
        >
          {/* Mic button */}
          <button className="p-1.5 text-primary-500 hover:bg-primary-50 rounded-xl flex-shrink-0 self-center">
            <Mic size={18} />
          </button>

          <textarea
            ref={inputRef}
            rows={1}
            className="flex-1 bg-transparent text-sm resize-none outline-none py-1.5 max-h-24
                       placeholder:text-gray-400"
            placeholder={t("chat.placeholder")}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="p-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white
                       flex-shrink-0 disabled:opacity-40 transition-colors self-center"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
