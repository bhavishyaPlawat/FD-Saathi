const { ChatSession } = require("../../models/ChatSession.model");
const { aiProvider } = require("../../services/ai");
const { ragService } = require("../rag/rag.service");
const mongoose = require("mongoose");
const { logger } = require("../../utils/logger"); // adjust path to your winston logger

// Devanagari unicode range — used to sanity-check Hindi responses
const DEVANAGARI_REGEX = /[\u0900-\u097F]/g;
const MIN_HINDI_CHARS = 15;

// Languages where we validate script quality
const SCRIPT_VALIDATED_LANGS = new Set(["hi", "mr"]);

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

    const isNewSession = !session;

    if (!session) {
      session = await ChatSession.create({
        userId: new mongoose.Types.ObjectId(userId),
        title: userMessage.slice(0, 50),
        messages: [],
      });
    }

    // 2. RAG retrieval — now includes hasReliableContext flag
    const ragContext = await ragService.retrieve(userMessage, language);

    // Log when retrieval confidence is low — useful for tuning your data
    if (!ragContext.hasReliableContext) {
      logger.warn("Low RAG confidence", {
        query: userMessage,
        language,
        matchCount: ragContext.chunks.length,
      });
    }

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
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    // Send session ID first so client knows which session this belongs to
    res.write(
      `data: ${JSON.stringify({ type: "session", sessionId: session._id })}\n\n`,
    );

    let fullResponse = "";
    // Buffer for the tail of the stream — we hold back the last ~100 chars
    // to prevent GLOSSARY_TERMS from being rendered in the UI live.
    // We flush it only after we've confirmed it contains no glossary line.
    let streamBuffer = "";
    const BUFFER_SIZE = 120; // slightly longer than "GLOSSARY_TERMS: " + typical terms

    try {
      for await (const chunk of aiProvider.streamChat(
        allMessages,
        systemPrompt,
      )) {
        if (!chunk.done) {
          streamBuffer += chunk.text;
          fullResponse += chunk.text;

          // Only flush what's safely before the buffer window
          if (streamBuffer.length > BUFFER_SIZE) {
            const safeToSend = streamBuffer.slice(
              0,
              streamBuffer.length - BUFFER_SIZE,
            );
            streamBuffer = streamBuffer.slice(
              streamBuffer.length - BUFFER_SIZE,
            );

            // Never stream a chunk that starts the GLOSSARY_TERMS line
            if (!safeToSend.includes("GLOSSARY_TERMS")) {
              res.write(
                `data: ${JSON.stringify({ type: "chunk", text: safeToSend })}\n\n`,
              );
            }
          }
        }
      }

      // Flush remaining buffer — but strip glossary line before sending
      if (streamBuffer) {
        const glossaryIndex = streamBuffer.indexOf("GLOSSARY_TERMS");
        const safeRemainder =
          glossaryIndex !== -1
            ? streamBuffer.slice(0, glossaryIndex).trim()
            : streamBuffer;

        if (safeRemainder) {
          res.write(
            `data: ${JSON.stringify({ type: "chunk", text: safeRemainder })}\n\n`,
          );
        }
      }
    } catch (err) {
      logger.error("SSE stream error", {
        error: err.message,
        userId,
        sessionId,
      });

      // Clean up the newly created session if nothing was saved yet
      if (isNewSession && session.messages.length === 0) {
        await ChatSession.findByIdAndDelete(session._id).catch(() => {});
      }

      res.write(
        `data: ${JSON.stringify({ type: "error", message: err.message })}\n\n`,
      );
      res.end();
      return;
    }

    // 6. Extract glossary terms from the full response
    const glossaryMatch = fullResponse.match(/GLOSSARY_TERMS:\s*(.+)/);
    const glossaryTerms = glossaryMatch
      ? glossaryMatch[1].split(",").map((t) => t.trim())
      : [];
    const cleanResponse = fullResponse.replace(/GLOSSARY_TERMS:.+/, "").trim();

    // 7. Hindi/script quality check — log if response looks wrong-language
    if (SCRIPT_VALIDATED_LANGS.has(language)) {
      const devanagariCount = (cleanResponse.match(DEVANAGARI_REGEX) || [])
        .length;
      if (devanagariCount < MIN_HINDI_CHARS) {
        logger.warn(
          "Script quality check failed — expected Devanagari response",
          {
            language,
            devanagariCount,
            userId,
            preview: cleanResponse.slice(0, 100),
          },
        );
        // Note: we still save and return the response rather than erroring.
        // Use these logs to tune your system prompt over time.
      }
    }

    // 8. Save both messages to MongoDB
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

    if (session.messages.length === 2) {
      session.title = userMessage.slice(0, 50);
    }

    await session.save();

    // 9. Send done event — now includes sources so frontend can show citations
    res.write(
      `data: ${JSON.stringify({
        type: "done",
        glossaryTerms,
        sources: ragContext.sources, // ← was retrieved but never sent before
        hasReliableContext: ragContext.hasReliableContext, // ← lets frontend show a caveat badge
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
