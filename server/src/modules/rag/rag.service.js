const { getPineconeIndex } = require("../../config/pinecone");
const { embeddingProvider } = require("../../services/embedding");

class RAGService {
  constructor() {
    this.topK = 5;
    this.similarityThreshold = 0.72;
  }

  async retrieve(query, language = "hi") {
    const index = getPineconeIndex();

    // 1. Embed the user query
    const queryVector = await embeddingProvider.embed(query);

    // 2. Search in user's language namespace first
    const results = await index.namespace(language).query({
      vector: queryVector,
      topK: this.topK,
      includeMetadata: true,
    });

    // 3. Fallback to English if not enough results
    let matches = results.matches;
    if (matches.length < 2) {
      const fallback = await index.namespace("en").query({
        vector: queryVector,
        topK: this.topK,
        includeMetadata: true,
      });
      matches = fallback.matches;
    }

    // 4. Filter by similarity score
    const goodMatches = matches.filter(
      (m) => (m.score ?? 0) > this.similarityThreshold,
    );

    const chunks = goodMatches.map((m) => m.metadata?.text).filter(Boolean);

    const sources = goodMatches.map((m) => m.metadata?.source).filter(Boolean);

    return { chunks, sources };
  }

  buildSystemPrompt(ragContext, language, userName) {
    const langMap = {
      hi: "Hindi",
      en: "English",
      mr: "Marathi",
      bn: "Bengali",
      te: "Telugu",
    };

    const contextBlock =
      ragContext.chunks.length > 0
        ? `\n\nKNOWLEDGE BASE (use this to answer):\n${ragContext.chunks.join("\n---\n")}`
        : "";

    return `You are Digital Saathi, a friendly financial literacy assistant helping Indian users understand Fixed Deposits (FDs).
Always respond in ${langMap[language] || "Hindi"}.
The user's name is ${userName}.
Be simple, warm, and avoid jargon. If you use a financial term, briefly explain it.
If you detect a financial jargon term in your response, output it in this format at the end:
GLOSSARY_TERMS: term1, term2
${contextBlock}`;
  }
}

const ragService = new RAGService();
module.exports = { ragService };
