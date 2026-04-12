const { ZodError } = require("zod");
const { logger } = require("../utils/logger");
const { sendError } = require("../utils/apiResponse");

/**
 * Global error handler — must be the LAST middleware registered in app.js.
 * Express identifies it as the error handler because it has 4 parameters.
 *
 * Handles:
 *   ZodError    → 422 with field-level errors
 *   JWT errors  → 401
 *   Known errors → their own message
 *   Unknown     → 500 (message hidden from client in production)
 */
// eslint-disable-next-line no-unused-vars
const errorMiddleware = (err, req, res, next) => {
  logger.error(err.message, {
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Zod validation error
  if (err instanceof ZodError) {
    return sendError(res, "Validation failed", 422, err.flatten().fieldErrors);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return sendError(res, "Invalid token", 401);
  }
  if (err.name === "TokenExpiredError") {
    return sendError(res, "Token expired", 401);
  }

  // Mongoose duplicate key (e.g. unique phone number)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return sendError(res, `${field} already exists`, 409);
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === "CastError") {
    return sendError(res, `Invalid ${err.path}`, 400);
  }

  // Known application errors (thrown with new Error('message'))
  if (err.isOperational) {
    return sendError(res, err.message, err.statusCode || 400);
  }

  // Unknown errors — hide detail in production
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message;

  return sendError(res, message, 500);
};

module.exports = { errorMiddleware };
