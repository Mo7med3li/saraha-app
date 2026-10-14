import type { NextFunction, Request, Response } from "express";

export const asyncHandler = (
  func: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => Promise<void | Response>,
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await func(req, res, next);
    } catch (error: unknown) {
      if (error instanceof Error) {
        error.cause = 500;
      }
      return next(error);
    }
  };
};

export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  return res.status((err.cause as number) || 400).json({
    success: false,
    message: err.message,
    stack: process.env.MODE === "Dev" ? err.stack : undefined,
  });
};

export const successResponse = <T>({
  res,
  statusCode,
  message,
  data,
}: {
  res: Response;
  statusCode: number;
  message: string;
  data?: T;
}) => {
  return res.status(statusCode || 200).json({
    success: true,
    message: message || "Success",
    data: data || undefined,
  });
};
