const winston = require("winston");
const { env } = require("../config/env");

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log line format for development
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: "HH:mm:ss" }),
  errors({ stack: true }),
  printf(({ timestamp, level, message, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length
      ? `\n${JSON.stringify(meta, null, 2)}`
      : "";
    return `${timestamp} [${level}]: ${stack || message}${metaStr}`;
  }),
);

// Clean JSON format for production log aggregators (Datadog etc.)
const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  winston.format.json(),
);

const logger = winston.createLogger({
  level: env.NODE_ENV === "production" ? "warn" : "debug",
  format: env.NODE_ENV === "production" ? prodFormat : devFormat,
  transports: [new winston.transports.Console()],
  // Do not exit on uncaught exceptions — let errorMiddleware handle them
  exitOnError: false,
});

module.exports = { logger };
