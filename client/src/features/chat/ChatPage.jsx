import { useEffect, useRef, useState } from "react";
import { Send, Plus, Mic } from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useChatStore } from "../../stores/chatStore";
import { useAuthStore } from "../../stores/authStore";
import i18n from "../../i18n";
import ReactMarkdown from "react-markdown";

// ── Glossary card ─────────────────────────────────────────────
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
        className={`max-w-[75%] md:max-w-[65%] px-4 py-3 rounded-2xl text-sm leading-relaxed
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
  { key: "chat.sug1", text: "FD क्या है?" },
  { key: "chat.sug2", text: "सबसे अच्छी FD कहाँ है?" },
  { key: "chat.sug3", text: "TDS क्या होता है?" },
  { key: "chat.sug4", text: "Senior citizen को क्या फायदा है?" },
  { key: "chat.sug5", text: "FD कैसे खुलती है?" },
];

export default function ChatPage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { messages, isStreaming, sendMessage, startNewChat, activeSession } =
    useChatStore();

  const [input, setInput] = useState("");
  const [lastGlossary, setLastGlossary] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceModeActive, setVoiceModeActive] = useState(false);
  const recognitionRef = useRef(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const SpeechReg = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechReg) {
      recognitionRef.current = new SpeechReg();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (e) => {
        const text = e.results[0][0].transcript;
        setInput(text);
        setVoiceModeActive(true); // Voice input used, reading out reply
      };
      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    return () => {
      window.speechSynthesis.cancel();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      toast.error(t("errors.generic", "Voice input not supported"));
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.lang = i18n.language === "hi" ? "hi-IN" : "en-IN";
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

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

  useEffect(() => {
    const last = messages[messages.length - 1];
    if (last?.role === "assistant" && last.glossaryTerms?.length) {
      setLastGlossary(last.glossaryTerms);
    }
    if (!isStreaming && voiceModeActive && messages.length > 0) {
      if (last?.role === "assistant" && last?.content) {
        const textToRead = last.content.replace(/[*#]/g, "").replace(/GLOSSARY_TERMS:.*/gi, "");
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.lang = i18n.language === "hi" ? "hi-IN" : "en-IN";
        window.speechSynthesis.speak(utterance);
        setVoiceModeActive(false); 
      }
    }
  }, [messages, isStreaming, voiceModeActive]);

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || isStreaming) return;
    window.speechSynthesis.cancel(); // stop current reading
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
    /* Mobile: fixed height accounting for top header + bottom nav
       Desktop: full remaining viewport height (sidebar handles nav) */
    <div className="flex flex-col h-[calc(100vh-7.5rem)] md:h-screen">
      {/* ── Chat header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold">
            DS
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">FD Saathi</p>
            <p className="text-xs text-primary-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse inline-block" />
              {t("chat.alwaysAvailable", "हमेशा उपलब्ध")}
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
                {t("chat.hello", "नमस्ते, {{name}}!", { name: user?.name })}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {t("chat.askAnything", "FD के बारे में कुछ भी पूछें")}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {SUGGESTIONS.map((q) => (
                <button key={q.key} onClick={() => setInput(t(q.key, q.text))} className="chip">
                  {t(q.key, q.text)}
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

        {!isStreaming && <GlossaryCard terms={lastGlossary} />}

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

        {messages.length > 0 && !isStreaming && (
          <div className="flex gap-2 px-4 overflow-x-auto pb-2 mt-2">
            {SUGGESTIONS.slice(0, 3).map((q) => (
              <button
                key={q.key}
                onClick={() => setInput(t(q.key, q.text))}
                className="chip flex-shrink-0"
              >
                {t(q.key, q.text)}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ────────────────────────────────────────── */}
      <div className="px-4 py-3 bg-white border-t border-gray-100 shrink-0 relative">
        {/* Siri-like listening indicator overlay */}
        {isRecording && (
          <div className="absolute -top-12 left-0 right-0 flex justify-center items-end pointer-events-none pb-2">
            <div className="flex items-center gap-1.5 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm border border-primary-100">
              <span className="text-xs font-bold text-primary-500 mr-2">{t("chat.listening", "सुन रहा हूँ...")}</span>
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-1.5 bg-primary-500 rounded-full animate-pulse"
                  style={{
                    height: `${Math.max(8, Math.random() * 24)}px`,
                    animationDuration: `${0.5 + Math.random() * 0.5}s`,
                    animationDelay: `${Math.random() * 0.5}s`
                  }}
                />
              ))}
            </div>
          </div>
        )}
        <div
          className="flex items-end gap-2 bg-gray-50 rounded-2xl px-3 py-2
                        border border-gray-200 focus-within:border-primary-400
                        focus-within:ring-2 focus-within:ring-primary-100 transition-all
                        max-w-3xl mx-auto"
        >
          <button
            onClick={toggleMic}
            className={`p-1.5 rounded-xl flex-shrink-0 self-center transition-colors ${
              isRecording ? "text-red-500 bg-red-50 animate-pulse" : "text-primary-500 hover:bg-primary-50"
            }`}
          >
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
