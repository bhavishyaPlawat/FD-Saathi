const { Router } = require("express");
const { register, login, me } = require("./auth.controller");
const { validate } = require("../../middleware/validate.middleware");
const { authMiddleware } = require("../../middleware/auth.middleware");
const { registerSchema, loginSchema } = require("./auth.schema");

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/me", authMiddleware, me); // protected route

module.exports = router;
