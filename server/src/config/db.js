const mongoose = require("mongoose");
const { env } = require("./env");
const { logger } = require("../utils/logger");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      // These are the recommended options for mongoose 8+
      serverSelectionTimeoutMS: 15000, // timeout after 15s
      socketTimeoutMS: 45000, // close sockets after 45s
    });

    logger.info(`✅  MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`❌  MongoDB connection failed: ${error.message}`);
    process.exit(1); // exit — app is useless without DB
  }
};

// Handle disconnection events after initial connect
mongoose.connection.on("disconnected", () => {
  logger.warn("⚠️   MongoDB disconnected");
});

mongoose.connection.on("reconnected", () => {
  logger.info("✅  MongoDB reconnected");
});

module.exports = { connectDB };
