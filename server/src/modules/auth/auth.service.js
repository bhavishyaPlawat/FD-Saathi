const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../../models/User.model");
const { env } = require("../../config/env");

class AuthService {
  async register(input) {
    // Check duplicate phone
    const existing = await User.findOne({ phone: input.phone });
    if (existing) {
      const err = new Error("Phone number already registered");
      err.isOperational = true;
      err.statusCode = 409;
      throw err;
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    const user = await User.create({
      name: input.name,
      phone: input.phone,
      passwordHash,
      language: input.language,
    });

    const token = this._sign(user);
    return { user: this._sanitize(user), token };
  }

  async login(input) {
    // select: false on passwordHash — must explicitly request it
    const user = await User.findOne({ phone: input.phone }).select(
      "+passwordHash",
    );

    if (!user) {
      const err = new Error("Invalid phone or password");
      err.isOperational = true;
      err.statusCode = 401;
      throw err;
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      const err = new Error("Invalid phone or password");
      err.isOperational = true;
      err.statusCode = 401;
      throw err;
    }

    const token = this._sign(user);
    return { user: this._sanitize(user), token };
  }

  async me(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const err = new Error("User not found");
      err.isOperational = true;
      err.statusCode = 404;
      throw err;
    }
    return this._sanitize(user);
  }

  _sign(user) {
    return jwt.sign(
      {
        id: user._id,
        name: user.name,
        language: user.language,
        role: user.role,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN },
    );
  }

  // Never send passwordHash to client
  _sanitize(user) {
    const obj = user.toObject();
    delete obj.passwordHash;
    return obj;
  }
}

const authService = new AuthService();
module.exports = { authService };
