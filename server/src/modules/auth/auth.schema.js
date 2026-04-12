const { z } = require("zod");

const registerSchema = z.object({
  name: z.string().min(2).max(50),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  language: z.enum(["hi", "en", "mr", "bn", "te"]).default("hi"),
});

const loginSchema = z.object({
  phone: z.string(),
  password: z.string(),
});

module.exports = { registerSchema, loginSchema };
