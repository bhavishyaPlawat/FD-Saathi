const rateLimit = require("express-rate-limit");

/**
 * globalLimiter  — applied to ALL routes in app.js
 *                  100 requests per 15 minutes per IP
 *
 * chatLimiter    — applied ONLY to /api/chat/stream
 *                  protects Claude API costs (20 req/min per IP)
 */

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again in a few minutes.",
  },
});

const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Chat rate limit reached. Please wait a moment.",
  },
});

module.exports = { globalLimiter, chatLimiter };
