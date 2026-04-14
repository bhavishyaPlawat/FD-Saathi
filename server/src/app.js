const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { env } = require("./config/env");
const { globalLimiter } = require("./middleware/rateLimit.middleware");
const { errorMiddleware } = require("./middleware/error.middleware");

// ─── Route imports ──────────────────────────────────────────────────────────
// Each module registers its own router — add new modules here only
const authRoutes = require("./modules/auth/auth.routes");
const userRoutes = require("./modules/user/user.routes");
const fdRoutes = require("./modules/fd/fd.routes");
const chatRoutes = require("./modules/chat/chat.routes");

const createApp = () => {
  const app = express();
  const allowedOrigins = [
    env.CLIENT_URL_PRODUCTION,
    env.CLIENT_URL_DEVELOPMENT,
  ];

  // ── Security headers ──────────────────────────────────────────────────────
  app.use(helmet());

  // ── CORS ──────────────────────────────────────────────────────────────────
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) {
          callback(null, true);
          return;
        }

        const normalizedOrigin = origin.replace(/\/+$/, "");
        if (allowedOrigins.includes(normalizedOrigin)) {
          callback(null, true);
          return;
        }

        callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );

  // ── Body parsing ──────────────────────────────────────────────────────────
  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ extended: true, limit: "10kb" }));

  // ── Health check (BEFORE rate limiter) ─────────────────────────────────────
  app.get("/health", (req, res) => {
    console.log("🔍 /health endpoint hit");
    res.json({
      success: true,
      message: "Digital Saathi API is running",
      env: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  });

  // ── Global rate limiter (AFTER health check) ───────────────────────────────
  app.use(globalLimiter);

  // ── API Routes ────────────────────────────────────────────────────────────
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/fd", fdRoutes);
  app.use("/api/chat", chatRoutes);

  // ── 404 handler ───────────────────────────────────────────────────────────
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `Route ${req.method} ${req.path} not found`,
    });
  });

  // ── Global error handler — MUST be last ──────────────────────────────────
  app.use(errorMiddleware);

  return app;
};

module.exports = { createApp };
