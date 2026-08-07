import { asyncHandler } from "../lib/utils/response.js";

export const validationMiddleware = (schema) => {
  return asyncHandler(async (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return next(new Error(error.message, { cause: 400 }));
    }
    return next();
  });
};
