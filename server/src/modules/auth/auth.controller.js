const { asyncHandler } = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/apiResponse");
const { authService } = require("./auth.service");

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  sendSuccess(res, result, "Registered successfully", 201);
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  sendSuccess(res, result, "Login successful");
});

// GET /api/auth/me — returns logged-in user's profile
const me = asyncHandler(async (req, res) => {
  const user = await authService.me(req.user._id);
  sendSuccess(res, user, "User fetched");
});

module.exports = { register, login, me };
