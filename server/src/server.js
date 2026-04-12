const { createApp } = require("./app");
const { connectDB } = require("./config/db");
const { env } = require("./config/env");
const { logger } = require("./utils/logger");

const startServer = async () => {
  // 1. Connect to MongoDB first
  await connectDB();

  // 2. Create the Express app
  const app = createApp();

  // 3. Start listening
  const server = app.listen(env.PORT, () => {
    logger.info(`🚀  Server running on http://localhost:${env.PORT}`);
    logger.info(`📌  Environment: ${env.NODE_ENV}`);
    logger.info(`🌐  Accepting requests from: ${env.CLIENT_URL}`);
  });

  // ── Graceful shutdown ────────────────────────────────────────────────────
  // When Ctrl+C or Docker stop is issued, close connections cleanly
  const shutdown = (signal) => {
    logger.info(`\n${signal} received — shutting down gracefully...`);
    server.close(() => {
      logger.info("✅  HTTP server closed");
      process.exit(0);
    });

    // Force exit if server hasn't closed in 10s
    setTimeout(() => {
      logger.error("❌  Forced shutdown after timeout");
      process.exit(1);
    }, 10_000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  // ── Unhandled errors ─────────────────────────────────────────────────────
  process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled Promise Rejection:", reason);
    // Don't crash in development, crash in production
    if (env.NODE_ENV === "production") process.exit(1);
  });
};

startServer();
