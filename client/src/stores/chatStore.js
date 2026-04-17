import { create } from "zustand";
import api from "../services/api";
import API_BASE_URL from "../config/apiBaseUrl";

export const useChatStore = create((set, get) => ({
  sessions: [],
  activeSession: null,
  messages: [],
  isStreaming: false,

  fetchSessions: async () => {
    const { data } = await api.get("/chat/sessions");
    set({ sessions: data.data });
  },

  loadSession: async (sessionId) => {
    const { data } = await api.get(`/chat/sessions/${sessionId}`);
    set({ activeSession: data.data, messages: data.data.messages });
  },

  startNewChat: () => {
    set({ activeSession: null, messages: [] });
  },

  deleteSession: async (sessionId) => {
    await api.delete(`/chat/sessions/${sessionId}`);
    set((state) => ({
      sessions: state.sessions.filter((s) => s._id !== sessionId),
      activeSession:
        state.activeSession?._id === sessionId ? null : state.activeSession,
      messages: state.activeSession?._id === sessionId ? [] : state.messages,
    }));
  },

  sendMessage: async (message, language) => {
    const { activeSession, messages } = get();

    // Optimistically add user message
    const userMsg = { role: "user", content: message, timestamp: new Date() };
    set({ messages: [...messages, userMsg], isStreaming: true });

    // Add empty assistant message that will be filled by stream
    const assistantMsg = {
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };
    set((state) => ({ messages: [...state.messages, assistantMsg] }));

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_BASE_URL}/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId: activeSession?._id || null,
          message,
          language,
        }),
      });

      // Check for HTTP errors before processing stream
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        if (response.status === 429) {
          // Rate limited
          const error = new Error("Rate limit exceeded");
          error.response = { status: 429, data: errorData };
          throw error;
        }

        if (response.status === 503) {
          // Service unavailable
          const error = new Error("Service temporarily unavailable");
          error.response = { status: 503, data: errorData };
          throw error;
        }

        // Other HTTP errors
        const error = new Error(errorData?.message || "Request failed");
        error.response = { status: response.status, data: errorData };
        throw error;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split("\n").filter((l) => l.startsWith("data: "));

        for (const line of lines) {
          try {
            const event = JSON.parse(line.replace("data: ", ""));

            if (event.type === "session") {
              set({ activeSession: { _id: event.sessionId } });
            }

            if (event.type === "chunk") {
              // Append chunk to last assistant message
              set((state) => {
                const msgs = [...state.messages];
                msgs[msgs.length - 1] = {
                  ...msgs[msgs.length - 1],
                  content: msgs[msgs.length - 1].content + event.text,
                };
                return { messages: msgs };
              });
            }

            if (event.type === "done") {
              set({ isStreaming: false });
              get().fetchSessions();
            }

            if (event.type === "error") {
              // Server sent error event
              const error = new Error(event.message || "Stream error");
              error.response = { status: 500 };
              throw error;
            }
          } catch (parseErr) {
            // skip malformed lines
            console.warn("Failed to parse SSE event:", parseErr);
          }
        }
      }
    } catch (err) {
      // Clean up failed message
      set((state) => ({
        messages: state.messages.slice(0, -2), // Remove both user and empty assistant messages
        isStreaming: false,
      }));

      // Re-throw with proper error info for UI to handle
      throw err;
    }
  },
}));
