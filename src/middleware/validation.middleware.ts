import type { Schema } from "joi";
import type { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../lib/utils/response.js";

type ValidationSchema = Partial<
  Record<"body" | "params" | "query" | "headers" | "files" | "file", Schema>
>;

export const validationMiddleware = (schema: ValidationSchema) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const validationErrors: { keys: string; message: string }[] = [];
    for (const keys of Object.keys(schema) as (keyof ValidationSchema)[]) {
      const validator = schema[keys];
      if (!validator) continue;

      const value =
        keys === "files"
          ? req.files
          : keys === "file"
            ? req.file
            : req[keys as keyof Request];

      const { error } = validator.validate(value);
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
