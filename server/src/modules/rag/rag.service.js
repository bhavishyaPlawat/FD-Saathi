const { getPineconeIndex } = require("../../config/pinecone");
const { embeddingProvider } = require("../../services/embedding");

// Jargon map: plain explanations injected into the prompt so the LLM
// knows exactly how to simplify these terms in vernacular responses.
const JARGON_SIMPLIFICATION = {
  hi: {
    "compounding interest":
      "byaj pe byaj (har period mein byaj badhta rehta hai)",
    "premature withdrawal": "time se pehle paisa nikalna",
    "premature withdrawal penalty": "time se pehle todne par katoti (fine)",
    maturity: "paisa wapas milne ki tarikh",
    "maturity amount": "FD khatam hone par milne wali poori raqam",
    TDS: "Tax Deducted at Source — bank khud aapke byaj mein se tax kaat leta hai",
    "Form 15G / 15H": "ek form jo aap bank ko dete ho taaki woh TDS na kaate",
    liquidity: "zarurat padne par paisa nikalne ki aasani",
    tenure: "kitne samay ke liye FD karni hai",
    NBFC: "Non-Banking Financial Company — bank jaisi company jo loan aur FD deti hai",
    "senior citizen":
      "60 saal ya usse zyada umra ke log — inhe zyada byaj milta hai",
    "cumulative FD": "byaj maturity par milta hai, beech mein nahi",
    "non-cumulative FD": "byaj har mahine ya quarter mein milta hai",
    "FD laddering":
      "bade paison ko chhote-chhote hisson mein alag-alag FD mein lagana",
  },
  mr: {
    "compounding interest": "व्याजावर व्याज (दर कालावधीत व्याज वाढत राहते)",
    "premature withdrawal": "मुदतपूर्व पैसे काढणे",
    maturity: "FD संपण्याची तारीख",
    TDS: "बँक स्वतः तुमच्या व्याजातून कर कापते",
    tenure: "किती काळासाठी FD करायची आहे",
  },
};

class RAGService {
  constructor() {
    // Static knowledge retrieval settings
    this.staticTopK = 4;
    this.staticSimilarityThreshold = 0.72;

    // Conversational memory settings
    this.memoryTopK = 3;
    this.memorySimilarityThreshold = 0.65; // Slightly lower - conversations are more varied

    // Namespace for conversational memory
    this.CONVERSATION_NAMESPACE = "conversations";
  }

  /**
   * THREE-TIER RETRIEVAL SYSTEM
   *
   * Tier 1: Static Knowledge Base (FD rates, tax info, domain knowledge)
   * Tier 2: Conversational Memory (user-AI message pairs from this session)
   * Tier 3: Recent Context (last N messages from DB)
   */
  async retrieve(query, language, sessionId, userId) {
    const index = getPineconeIndex();
    const queryVector = await embeddingProvider.embed(query);

    // TIER 1: Query static knowledge base (existing implementation)
    const staticKnowledge = await this._retrieveStaticKnowledge(
      index,
      queryVector,
      language,
    );

    // TIER 2: Query conversational memory (NEW)
    const conversationalMemory = await this._retrieveConversationalMemory(
      index,
      queryVector,
      sessionId,
      userId,
    );

    // Combine results
    const allChunks = [
      ...staticKnowledge.chunks,
      ...conversationalMemory.chunks,
    ];

    const allSources = [
      ...staticKnowledge.sources,
      ...conversationalMemory.sources,
    ];

    // Determine confidence: reliable if we have good matches from either source
    const hasReliableContext =
      staticKnowledge.hasReliableContext ||
      conversationalMemory.hasReliableContext;

    return {
      chunks: allChunks,
      sources: allSources,
      hasReliableContext,
      // Breakdown for debugging/monitoring
      staticMatches: staticKnowledge.chunks.length,
      conversationMatches: conversationalMemory.chunks.length,
    };
  }

  /**
   * TIER 1: Retrieve from static knowledge base (FD rates, tax info, etc.)
   * Language-specific namespaces: hi, en, mr, bn, te
   */
  async _retrieveStaticKnowledge(index, queryVector, language) {
    // Search in user's language namespace first
    let results = await index.namespace(language).query({
      vector: queryVector,
      topK: this.staticTopK,
      includeMetadata: true,
    });

    let matches = results.matches;

    // Fallback to English if not enough results
    if (matches.length < 2) {
      const fallback = await index.namespace("en").query({
        vector: queryVector,
        topK: this.staticTopK,
        includeMetadata: true,
      });
      matches = fallback.matches;
    }

    // Filter by similarity score
    const goodMatches = matches.filter(
      (m) => (m.score ?? 0) > this.staticSimilarityThreshold,
    );

    const chunks = goodMatches.map((m) => m.metadata?.text).filter(Boolean);
    const sources = goodMatches.map((m) => m.metadata?.source).filter(Boolean);

    return {
      chunks,
      sources,
      hasReliableContext: goodMatches.length >= 2,
    };
  }

  /**
   * TIER 2: Retrieve from conversational memory (NEW)
   * Stores user-AI message pairs with session/user metadata
   */
  async _retrieveConversationalMemory(index, queryVector, sessionId, userId) {
    try {
      const results = await index.namespace(this.CONVERSATION_NAMESPACE).query({
        vector: queryVector,
        topK: this.memoryTopK,
        filter: {
          sessionId: sessionId,
          userId: userId.toString(),
        },
        includeMetadata: true,
      });

      const goodMatches = results.matches.filter(
        (m) => (m.score ?? 0) > this.memorySimilarityThreshold,
      );

      const chunks = goodMatches
        .map((m) => {
          // Format: "User: <question>\nAssistant: <answer>"
          return m.metadata?.conversationPair;
        })
        .filter(Boolean);

      return {
        chunks,
        sources: ["conversation-history"],
        hasReliableContext: goodMatches.length >= 1,
      };
    } catch (err) {
      // Conversation namespace might not exist yet for new sessions
      return {
        chunks: [],
        sources: [],
        hasReliableContext: false,
      };
    }
  }

  /**
   * Store a conversational exchange (user message + AI response) as a vector
   * This enables the AI to remember and reference previous exchanges
   */
  async storeConversationPair(
    userMessage,
    aiResponse,
    sessionId,
    userId,
    language,
  ) {
    const index = getPineconeIndex();

    // Create a combined text representation
    const conversationPair = `User: ${userMessage}\nAssistant: ${aiResponse}`;

    // Embed the pair
    const vector = await embeddingProvider.embed(conversationPair);

    // Generate unique ID
    const id = `${sessionId}-${Date.now()}`;

    // Upsert to conversations namespace
    await index.namespace(this.CONVERSATION_NAMESPACE).upsert([
      {
        id,
        values: vector,
        metadata: {
          sessionId,
          userId: userId.toString(),
          language,
          conversationPair,
          userMessage,
          aiResponse,
          timestamp: new Date().toISOString(),
        },
      },
    ]);
  }

  buildSystemPrompt(ragContext, language, userName) {
    const langMap = {
      hi: "Hindi",
      en: "English",
      mr: "Marathi",
      bn: "Bengali",
      te: "Telugu",
    };

    const langName = langMap[language] || "Hindi";
    const jargonMap = JARGON_SIMPLIFICATION[language] || {};

    // Build jargon instruction block only if we have terms for this language
    const jargonBlock =
      Object.keys(jargonMap).length > 0
        ? `\nWhen you use any of these financial terms, explain them using the simple version in parentheses:\n${Object.entries(
            jargonMap,
          )
            .map(([term, simple]) => `  - "${term}" → ${simple}`)
            .join("\n")}`
        : "";

    // Context block with clear sections for static knowledge and conversation history
    let contextBlock = "";

    if (ragContext.chunks.length > 0) {
      // Separate static knowledge from conversation history
      const staticChunks = ragContext.chunks.slice(0, ragContext.staticMatches);
      const conversationChunks = ragContext.chunks.slice(
        ragContext.staticMatches,
      );

      if (staticChunks.length > 0) {
        contextBlock += `\n\n--- FD KNOWLEDGE BASE (use for rates, rules, facts) ---\n${staticChunks.join("\n---\n")}\n--- END OF KNOWLEDGE BASE ---`;
      }

      if (conversationChunks.length > 0) {
        contextBlock += `\n\n--- PREVIOUS CONVERSATION CONTEXT ---\n${conversationChunks.join("\n---\n")}\n--- END OF CONVERSATION CONTEXT ---`;
      }
    }

    // Anti-hallucination instruction — escalates when retrieval is weak
    const dataConfidenceRule = ragContext.hasReliableContext
      ? `Use the retrieved data above to answer. Always cite specific rates or facts from the knowledge base when discussing FD details.`
      : `WARNING: Limited data available for this query.
Do NOT guess or invent any interest rates, penalty amounts, or bank-specific numbers.
Clearly tell the user: "${
          language === "hi"
            ? "Mujhe is sawaal ka current data abhi nahi mila. Sahi jaankari ke liye bank ki website ya branch se confirm karein."
            : "I don't have current data for this specific question. Please confirm details from the bank's website or branch."
        }"`;

    return `You are Digital Saathi, a friendly financial literacy assistant helping Indian users understand Fixed Deposits (FDs).

LANGUAGE: Always respond entirely in ${langName}. If the user's message is in ${langName}, reply in ${langName}. Do not switch languages mid-response. Bank names, numbers, and percentages can stay in English.

USER: The user's name is ${userName}. Address them warmly by name occasionally.

TONE: Simple, warm, conversational. Imagine explaining to a family member who is not a finance expert.
${jargonBlock}

ACCURACY RULES (strictly follow these — this is a financial product):
- ${dataConfidenceRule}
- Never say a rate is "approximately" — give the exact number from the knowledge base or say you don't have it.
- If asked to compare banks and you only have data for one, say so clearly.
- Never recommend a specific bank as "the best" — present options and let the user decide.
- If you referenced information from previous conversation, acknowledge it naturally (e.g., "As we discussed earlier...")

GLOSSARY FOOTER: If you use any financial term in your response, list it at the very end in this format:
GLOSSARY_TERMS: term1, term2
${contextBlock}`;
  }
}

const ragService = new RAGService();
module.exports = { ragService };
