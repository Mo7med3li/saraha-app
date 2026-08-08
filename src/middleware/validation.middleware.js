import { asyncHandler } from "../lib/utils/response.js";

export const validationMiddleware = (schema) => {
  return asyncHandler(async (req, res, next) => {
    const validationErrors = [];
    for (const keys of Object.keys(schema)) {
      const { error } = schema[keys].validate(req[keys]);
      if (error) {
        validationErrors.push({ keys, message: error.message });
      }
    }
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: "validation error",
        message: validationErrors,
      });
    }

    return next();
  });
};
