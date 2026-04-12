const { User } = require("../../models/User.model");

class UserService {
  async getProfile(userId) {
    const user = await User.findById(userId).lean();
    if (!user) {
      const err = new Error("User not found");
      err.isOperational = true;
      err.statusCode = 404;
      throw err;
    }
    return user;
  }

  async updateProfile(userId, updates) {
    const allowed = ["name", "language", "onboardingDone"];
    const filtered = {};
    allowed.forEach((key) => {
      if (updates[key] !== undefined) filtered[key] = updates[key];
    });

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: filtered },
      { new: true, runValidators: true },
    ).lean();

    if (!user) {
      const err = new Error("User not found");
      err.isOperational = true;
      err.statusCode = 404;
      throw err;
    }

    return user;
  }
}

const userService = new UserService();
module.exports = { userService };
