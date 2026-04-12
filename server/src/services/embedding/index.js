const { GeminiEmbeddingProvider } = require("./GeminiEmbeddingProvider");

// Swap embedding provider here — one line change
const embeddingProvider = new GeminiEmbeddingProvider();

module.exports = { embeddingProvider };
