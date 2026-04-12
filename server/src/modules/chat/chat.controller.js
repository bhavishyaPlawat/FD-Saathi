const { chatService } = require("./chat.service");
const { asyncHandler } = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/apiResponse");

// POST /api/chat/stream
// SSE — cannot use asyncHandler since we manage res manually
const streamMessage = async (req, res, next) => {
  try {
    const { sessionId = null, message, language } = req.body;
    const userId = req.user._id;
    const userName = req.user.name;
    const lang = language || req.user.language || "hi";

    if (!message || !message.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Message is required" });
    }

    await chatService.streamMessage(
      sessionId,
      userId,
      message.trim(),
      lang,
      userName,
      res,
    );
  } catch (err) {
    next(err);
  }
};

// GET /api/chat/sessions
const getSessions = asyncHandler(async (req, res) => {
  const sessions = await chatService.getSessions(req.user._id);
  sendSuccess(res, sessions, "Sessions fetched");
});

// GET /api/chat/sessions/:id
const getSession = asyncHandler(async (req, res) => {
  const session = await chatService.getSession(req.params.id, req.user._id);
  sendSuccess(res, session, "Session fetched");
});

// DELETE /api/chat/sessions/:id
const deleteSession = asyncHandler(async (req, res) => {
  await chatService.deleteSession(req.params.id, req.user._id);
  sendSuccess(res, null, "Session deleted");
});

module.exports = { streamMessage, getSessions, getSession, deleteSession };
