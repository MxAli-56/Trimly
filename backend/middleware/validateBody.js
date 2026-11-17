// middleware/validateBody.js
export const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");
      return res
        .status(400)
        .json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: errorMessage },
        });
    }
    next();
  };
};

// Naya Middleware: URL ke parameters ke liye (e.g., /leaves/:leaveId)
export const validateParams = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.params, { abortEarly: false });
    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");
      return res
        .status(400)
        .json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: errorMessage },
        });
    }
    next();
  };
};

// Naya Middleware: URL ke Query strings ke liye (e.g., ?date=..., ?page=1)
export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");
      return res
        .status(400)
        .json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: errorMessage },
        });
    }
    req.query = value; // Validated values ko overwrite kardo
    next();
  };
};