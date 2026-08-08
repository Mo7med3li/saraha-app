import { asyncHandler } from "../lib/utils/response.js";

export const validationMiddleware = (schema) => {
  return asyncHandler(async (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "validation error",
        message: error.message,
      });
    }
    return next();
  });
};
