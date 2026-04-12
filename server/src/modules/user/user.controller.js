const { asyncHandler } = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/apiResponse");
const { userService } = require("./user.service");

// GET /api/users/profile
const getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.user._id);
  sendSuccess(res, user, "Profile fetched");
});

// PATCH /api/users/profile
const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user._id, req.body);
  sendSuccess(res, user, "Profile updated");
});

module.exports = { getProfile, updateProfile };
