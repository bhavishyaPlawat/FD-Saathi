const { ChatSession } = require("../../models/ChatSession.model");
const { aiProvider } = require("../../services/ai");
const { ragService } = require("../rag/rag.service");
const mongoose = require("mongoose");

class ChatService {
  /**
   * Stream a chat response over SSE.
   * Writes SSE events directly to `res`.
   */
  async streamMessage(sessionId, userId, userMessage, language, userName, res) {
    // 1. Get or create session
    let session = sessionId
      ? await ChatSession.findOne({ _id: sessionId, userId })
      : null;

    if (!session) {
      session = await ChatSession.create({
        userId: new mongoose.Types.ObjectId(userId),
        title: userMessage.slice(0, 50),
        messages: [],
      });
    }

    // 2. RAG retrieval
    const ragContext = await ragService.retrieve(userMessage, language);

    // 3. Build messages array (last 10 for context window)
    const historyMessages = session.messages.slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const allMessages = [
      ...historyMessages,
      { role: "user", content: userMessage },
    ];

    // 4. Build system prompt with RAG context
    const systemPrompt = ragService.buildSystemPrompt(
      ragContext,
      language,
      userName,
    );

    // 5. Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // disable nginx buffering
    res.flushHeaders();

    // Send session ID first so client knows which session this belongs to
    res.write(
      `data: ${JSON.stringify({ type: "session", sessionId: session._id })}\n\n`,
    );

    let fullResponse = "";

    try {
      for await (const chunk of aiProvider.streamChat(
        allMessages,
        systemPrompt,
      )) {
        if (!chunk.done) {
          fullResponse += chunk.text;
          res.write(
            `data: ${JSON.stringify({ type: "chunk", text: chunk.text })}\n\n`,
          );
        }
      }
    } catch (err) {
      res.write(
        `data: ${JSON.stringify({ type: "error", message: err.message })}\n\n`,
      );
      res.end();
      return;
    }

    // 6. Extract glossary terms from response
    const glossaryMatch = fullResponse.match(/GLOSSARY_TERMS:\s*(.+)/);
    const glossaryTerms = glossaryMatch
      ? glossaryMatch[1].split(",").map((t) => t.trim())
      : [];
    const cleanResponse = fullResponse.replace(/GLOSSARY_TERMS:.+/, "").trim();

    // 7. Save both messages to MongoDB
    session.messages.push(
      {
        role: "user",
        content: userMessage,
        language,
        timestamp: new Date(),
      },
      {
        role: "assistant",
        content: cleanResponse,
        language,
        glossaryTerms,
        timestamp: new Date(),
      },
    );

    // Auto-update title from first message
    if (session.messages.length === 2) {
      session.title = userMessage.slice(0, 50);
    }

    await session.save();

    // 8. Send done event with glossary terms
    res.write(
      `data: ${JSON.stringify({
        type: "done",
        glossaryTerms,
        sessionId: session._id,
      })}\n\n`,
    );

    res.end();
  }

  async getSessions(userId) {
    return ChatSession.find({ userId })
      .sort({ updatedAt: -1 })
      .select("title updatedAt messages")
      .lean();
  }

  async getSession(sessionId, userId) {
    const session = await ChatSession.findOne({
      _id: sessionId,
      userId,
    }).lean();

    if (!session) {
      const err = new Error("Session not found");
      err.isOperational = true;
      err.statusCode = 404;
      throw err;
    }

    return session;
  }

  async deleteSession(sessionId, userId) {
    const session = await ChatSession.findOneAndDelete({
      _id: sessionId,
      userId,
    });

    if (!session) {
      const err = new Error("Session not found");
      err.isOperational = true;
      err.statusCode = 404;
      throw err;
    }
  }
}

const chatService = new ChatService();
module.exports = { chatService };
