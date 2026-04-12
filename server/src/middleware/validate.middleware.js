/**
 * Factory that returns an Express middleware which validates
 * req.body against the provided Zod schema.
 *
 * On failure: throws ZodError → caught by errorMiddleware → 422
 * On success: calls next() with the parsed (coerced) data in req.body
 *
 * Usage:
 *   router.post('/register', validate(registerSchema), authController.register)
 */
const validate = (schema) => (req, res, next) => {
  try {
    // Replace req.body with the parsed result so types are correct
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { validate };
