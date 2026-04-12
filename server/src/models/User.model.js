const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^[6-9]\d{9}$/, "Invalid Indian phone number"],
    },
    passwordHash: { type: String, required: true, select: false },
    language: {
      type: String,
      enum: ["hi", "en", "mr", "bn", "te"],
      default: "hi",
    },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    onboardingDone: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);
module.exports = { User };
