const { ChatSession } = require("../../models/ChatSession.model");
const { aiProvider } = require("../../services/ai");
const { ragService } = require("../rag/rag.service");
const mongoose = require("mongoose");
const { logger } = require("../../utils/logger");

// Devanagari unicode range — used to sanity-check Hindi responses
const DEVANAGARI_REGEX = /[\u0900-\u097F]/g;
const MIN_HINDI_CHARS = 15;

// Languages where we validate script quality
const SCRIPT_VALIDATED_LANGS = new Set(["hi", "mr"]);

class ChatService {
  /**
   * Stream a chat response over SSE with enhanced RAG and language detection.
   *
   * NEW FEATURES:
   * 1. Auto-detects language from user message (overrides profile language)
   * 2. Three-tier RAG: static knowledge + conversational memory + recent context
   * 3. Stores conversation pairs as vectors for future retrieval
   */
  async streamMessage(
    sessionId,
    userId,
    userMessage,
    profileLanguage,
    userName,
    res,
  ) {
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

    // 2. LANGUAGE DETECTION (NEW)
    // Detect actual language from message, fallback to profile language
    let detectedLanguage;
    try {
      detectedLanguage = await aiProvider.detectLanguage(
        userMessage,
        profileLanguage,
      );

      logger.info("Language detected", {
        userMessage: userMessage.slice(0, 50),
        detected: detectedLanguage,
        profile: profileLanguage,
      });
    } catch (err) {
      logger.warn("Language detection failed, using profile language", {
        error: err.message,
      });
      detectedLanguage = profileLanguage;
    }

    // Use detected language for this response
    const responseLanguage = detectedLanguage;

    // 3. THREE-TIER RAG RETRIEVAL (ENHANCED)
    // Retrieves from:
    // - Static knowledge base (FD rates, tax info)
    // - Conversational memory (previous user-AI exchanges)
    // - Recent messages from DB (context continuity)
    const ragContext = await ragService.retrieve(
      userMessage,
      responseLanguage,
      session._id.toString(),
      userId,
    );

    // Log retrieval stats for monitoring
    logger.info("RAG retrieval completed", {
      staticMatches: ragContext.staticMatches,
      conversationMatches: ragContext.conversationMatches,
      hasReliableContext: ragContext.hasReliableContext,
      language: responseLanguage,
    });

    // Warn if retrieval confidence is low
    if (!ragContext.hasReliableContext) {
      logger.warn("Low RAG confidence", {
        query: userMessage,
        language: responseLanguage,
        staticMatches: ragContext.staticMatches,
        conversationMatches: ragContext.conversationMatches,
      });
    }

    // 4. Build messages array (last 10 for context window)
    const historyMessages = session.messages.slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const allMessages = [
      ...historyMessages,
      { role: "user", content: userMessage },
    ];

    // 5. Build system prompt with detected language
    const systemPrompt = ragService.buildSystemPrompt(
      ragContext,
      responseLanguage,
      userName,
    );

    // 6. Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    // Send session ID and detected language
    res.write(
      `data: ${JSON.stringify({
        type: "session",
        sessionId: session._id,
        detectedLanguage: responseLanguage, // Send detected language to frontend
      })}\n\n`,
    );

    let fullResponse = "";
    // Buffer for the tail of the stream
    let streamBuffer = "";
    const BUFFER_SIZE = 120;

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

    // 7. Extract glossary terms from the full response
    const glossaryMatch = fullResponse.match(/GLOSSARY_TERMS:\s*(.+)/);
    const glossaryTerms = glossaryMatch
      ? glossaryMatch[1].split(",").map((t) => t.trim())
      : [];
    const cleanResponse = fullResponse.replace(/GLOSSARY_TERMS:.+/, "").trim();

    // 8. Script quality check for Hindi/Marathi responses
    if (SCRIPT_VALIDATED_LANGS.has(responseLanguage)) {
      const devanagariCount = (cleanResponse.match(DEVANAGARI_REGEX) || [])
        .length;
      if (devanagariCount < MIN_HINDI_CHARS) {
        logger.warn(
          "Script quality check failed — expected Devanagari response",
          {
            language: responseLanguage,
            devanagariCount,
            userId,
            preview: cleanResponse.slice(0, 100),
          },
        );
      }
    }

    // 9. Save both messages to MongoDB
    session.messages.push(
      {
        role: "user",
        content: userMessage,
        language: responseLanguage, // Save detected language
        timestamp: new Date(),
      },
      {
        role: "assistant",
        content: cleanResponse,
        language: responseLanguage,
        glossaryTerms,
        timestamp: new Date(),
      },
    );

    if (session.messages.length === 2) {
      session.title = userMessage.slice(0, 50);
    }

    await session.save();

    // 10. STORE CONVERSATIONAL MEMORY (NEW)
    // Store the user-AI exchange as a vector for future retrieval
    try {
      await ragService.storeConversationPair(
        userMessage,
        cleanResponse,
        session._id.toString(),
        userId,
        responseLanguage,
      );

      logger.info("Conversation pair stored in vector DB", {
        sessionId: session._id,
        language: responseLanguage,
      });
    } catch (err) {
      // Non-critical: log but don't fail the request
      logger.error("Failed to store conversation pair", {
        error: err.message,
        sessionId: session._id,
      });
    }

    // 11. Send done event with all metadata
    res.write(
      `data: ${JSON.stringify({
        type: "done",
        glossaryTerms,
        sources: ragContext.sources,
        hasReliableContext: ragContext.hasReliableContext,
        detectedLanguage: responseLanguage, // Include in done event too
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
