const { GoogleGenAI } = require("@google/genai");
const { env } = require("../../config/env");

class GeminiEmbeddingProvider {
  constructor() {
    this.ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    this.model = "gemini-embedding-001";
    this.dimensions = 768;
  }

  async embed(text) {
    const response = await this.ai.models.embedContent({
      model: this.model,
      contents: text,
      config: {
        outputDimensionality: this.dimensions,
      },
    });
    return response.embeddings[0].values;
  }

  async embedBatch(texts) {
    // Gemini doesn't have native batch embed — run in parallel with concurrency limit
    const CONCURRENCY = 5;
    const results = [];

    for (let i = 0; i < texts.length; i += CONCURRENCY) {
      const batch = texts.slice(i, i + CONCURRENCY);
      const embeddings = await Promise.all(batch.map((t) => this.embed(t)));
      results.push(...embeddings);
    }

    return results;
  }
}

module.exports = { GeminiEmbeddingProvider };
