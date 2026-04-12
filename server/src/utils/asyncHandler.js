/**
 * Wraps an async Express route handler.
 * Any thrown error or rejected promise is forwarded to next(err)
 * so it gets caught by errorMiddleware.
 *
 * Without this: every controller needs its own try/catch.
 * With this: controllers are clean, error handling is centralised.
 *
 * Usage:
 *   router.get('/example', asyncHandler(async (req, res) => {
 *     const data = await someService()
 *     res.json(data)
 *   }))
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { asyncHandler };
