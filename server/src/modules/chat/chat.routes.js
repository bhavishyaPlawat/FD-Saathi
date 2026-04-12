const { Router } = require("express");
const {
  streamMessage,
  getSessions,
  getSession,
  deleteSession,
} = require("./chat.controller");
const { authMiddleware } = require("../../middleware/auth.middleware");
const { chatLimiter } = require("../../middleware/rateLimit.middleware");

const router = Router();

// All chat routes require auth
router.use(authMiddleware);

router.post("/stream", chatLimiter, streamMessage); // SSE stream
router.get("/sessions", getSessions); // list all sessions
router.get("/sessions/:id", getSession); // single session
router.delete("/sessions/:id", deleteSession); // delete session

module.exports = router;
