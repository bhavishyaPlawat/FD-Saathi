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

    // 5. Flag when retrieval confidence is low so the prompt can warn the LLM
    const hasReliableContext = goodMatches.length >= 2;

    return { chunks, sources, hasReliableContext };
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

    // Context block with a clear boundary so the LLM doesn't confuse
    // retrieved data with its own training knowledge
    const contextBlock =
      ragContext.chunks.length > 0
        ? `\n\n--- RETRIEVED FD DATA (use ONLY this for rates and numbers) ---\n${ragContext.chunks.join("\n---\n")}\n--- END OF RETRIEVED DATA ---`
        : "";

    // Anti-hallucination instruction — escalates when retrieval is weak
    const dataConfidenceRule = ragContext.hasReliableContext
      ? `Use the retrieved data above to answer. Always cite the specific rate or number from the data.`
      : `WARNING: The retrieved data for this query is limited or unavailable.
Do NOT guess or invent any interest rates, penalty amounts, or bank-specific numbers.
Clearly tell the user: "${
          language === "hi"
            ? "Mujhe is bank ka current data abhi nahi mila. Sahi rate ke liye bank ki website ya branch se confirm karein."
            : "I don't have current data for this. Please confirm the exact rate from the bank's website or branch."
        }"`;

    return `You are Digital Saathi, a friendly financial literacy assistant helping Indian users understand Fixed Deposits (FDs).

LANGUAGE: Always respond entirely in ${langName}. if you are unsure about language then reply in "Hindi"  Do not switch to English mid-response. Bank names, numbers, and percentages can stay in English.

USER: The user's name is ${userName}. Address them warmly by name occasionally.

TONE: Simple, warm, conversational. Imagine explaining to a family member who is not a finance expert.
${jargonBlock}

ACCURACY RULES (strictly follow these — this is a financial product):
- ${dataConfidenceRule}
- Never say a rate is "approximately" — give the exact number from the data or say you don't have it.
- If the user asks to compare two banks and you only have data for one, say so clearly.
- Never recommend a specific bank or product as "the best" — present options and let the user decide.

GLOSSARY FOOTER: If you use any financial term in your response, list it at the very end in this format:
GLOSSARY_TERMS: term1, term2
${contextBlock}`;
  }
}

const ragService = new RAGService();
module.exports = { ragService };
