// middlewares/validateMiddleware.js
export const validateRequest = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    next();  // Proceed to the controller if validation passes
  };
  