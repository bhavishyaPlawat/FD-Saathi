/**
 * Standardised response helpers.
 * Every endpoint uses these — frontend always gets the same shape:
 *
 * Success: { success: true,  message, data, meta? }
 * Error:   { success: false, message, errors? }
 *
 * Never call res.json() directly in controllers — use these instead.
 */

const sendSuccess = (
  res,
  data,
  message = "Success",
  statusCode = 200,
  meta = null,
) => {
  const body = { success: true, message, data };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
};

const sendError = (
  res,
  message = "Something went wrong",
  statusCode = 500,
  errors = null,
) => {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
};

module.exports = { sendSuccess, sendError };
