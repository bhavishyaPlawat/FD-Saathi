const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true },
  language: { type: String, default: "hi" },
  glossaryTerms: [{ type: String }],
  timestamp: { type: Date, default: Date.now },
});

const chatSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, default: "New conversation" },
    messages: [messageSchema],
  },
  { timestamps: true },
);

// For history page — sorted by latest
chatSessionSchema.index({ userId: 1, updatedAt: -1 });

const ChatSession = mongoose.model("ChatSession", chatSessionSchema);
module.exports = { ChatSession };
