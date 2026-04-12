const { asyncHandler } = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/apiResponse");
const { fdService } = require("./fd.service");

// GET /api/fd/rates?bankType=govt&tenorMonths=12
const getRates = asyncHandler(async (req, res) => {
  const rates = await fdService.getRates(req.query);
  sendSuccess(res, rates, "Rates fetched");
});

// GET /api/fd/compare?tenorMonths=12&amount=100000&isSenior=false
const compareRates = asyncHandler(async (req, res) => {
  const { tenorMonths, amount, isSenior } = req.query;

  if (!tenorMonths || !amount) {
    return res.status(400).json({
      success: false,
      message: "tenorMonths and amount are required",
    });
  }

  const result = await fdService.compareRates(
    tenorMonths,
    Number(amount),
    isSenior === "true",
  );
  sendSuccess(res, result, "Comparison ready");
});

// GET /api/fd/featured
const getFeatured = asyncHandler(async (req, res) => {
  const rates = await fdService.getFeatured();
  sendSuccess(res, rates, "Featured rates fetched");
});

// POST /api/fd/seed  (admin only — for populating initial data)
const seedRates = asyncHandler(async (req, res) => {
  const result = await fdService.seedRates();
  sendSuccess(res, result, result.message);
});

module.exports = { getRates, compareRates, getFeatured, seedRates };
