const { Router } = require("express");
const {
  getRates,
  compareRates,
  getFeatured,
  seedRates,
} = require("./fd.controller");
const { authMiddleware } = require("../../middleware/auth.middleware");

const router = Router();

// Public routes — no auth needed
router.get("/rates", getRates);
router.get("/compare", compareRates);
router.get("/featured", getFeatured);

// Admin only — seed initial data
router.post("/seed", authMiddleware, seedRates);

module.exports = router;
