const jwt = require("jsonwebtoken");
const { env } = require("../config/env");
const { sendError } = require("../utils/apiResponse");

/**
 * Reads the Authorization header (Bearer <token>),
 * verifies the JWT, and attaches the decoded payload to req.user.
 *
 * Downstream controllers access: req.user._id, req.user.name,
 * req.user.language, req.user.role
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, "No token provided", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    // Attach only what controllers need — not the whole DB document
    req.user = {
      _id: decoded.id,
      name: decoded.name,
      language: decoded.language,
      role: decoded.role,
    };
    next();
  } catch (err) {
    // JWT errors handled in errorMiddleware
    next(err);
  }
};

module.exports = { authMiddleware };
