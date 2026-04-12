const { Router } = require("express");
const { getProfile, updateProfile } = require("./user.controller");
const { authMiddleware } = require("../../middleware/auth.middleware");

const router = Router();

router.use(authMiddleware);

router.get("/profile", getProfile);
router.patch("/profile", updateProfile);

module.exports = router;
