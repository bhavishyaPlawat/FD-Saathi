const { Pinecone } = require("@pinecone-database/pinecone");
const { env } = require("./env");

// Singleton — create the client once and reuse
let pineconeClient = null;

const getPineconeClient = () => {
  if (!pineconeClient) {
    pineconeClient = new Pinecone({
      apiKey: env.PINECONE_API_KEY,
    });
  }
  return pineconeClient;
};

// Returns the index object ready for query/upsert
// All RAG code calls this — never imports Pinecone directly
const getPineconeIndex = () => {
  return getPineconeClient().index(env.PINECONE_INDEX);
};

module.exports = { getPineconeClient, getPineconeIndex };
