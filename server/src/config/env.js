const { z } = require("zod");
require("dotenv").config();

const normalizeUrl = (url) => url.replace(/\/+$/, "");

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(5000),

  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),

  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),

  // Single Gemini key — handles both chat AND embeddings
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),

  PINECONE_API_KEY: z.string().min(1, "PINECONE_API_KEY is required"),
  PINECONE_INDEX: z.string().default("digital-saathi"),
  PINECONE_ENVIRONMENT: z.string().default("us-east-1"),

  CLIENT_URL_PRODUCTION: z
    .string()
    .default("https://fd-saarthi.vercel.app"),
  CLIENT_URL_DEVELOPMENT: z.string().default("http://localhost:5173"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌  Invalid environment variables:\n");
  const errors = parsed.error.flatten().fieldErrors;
  Object.entries(errors).forEach(([key, messages]) => {
    console.error(`   ${key}: ${messages.join(", ")}`);
  });
  console.error("\n👉  Check your .env file and try again.");
  process.exit(1);
}

const env = Object.freeze({
  ...parsed.data,
  CLIENT_URL_PRODUCTION: normalizeUrl(parsed.data.CLIENT_URL_PRODUCTION),
  CLIENT_URL_DEVELOPMENT: normalizeUrl(parsed.data.CLIENT_URL_DEVELOPMENT),
});
module.exports = { env };
