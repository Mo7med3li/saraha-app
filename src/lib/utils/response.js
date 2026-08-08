export const asyncHandler = (func) => {
  return async (req, res, next) => {
    try {
      await func(req, res, next);
    } catch (error) {
      error.cause = 500;
      return next(error);
    }
  };
};

export const globalErrorHandler = (err, req, res, next) => {
  return res.status(err.cause || 400).json({
    message: err.message,
    stack: process.env.MODE === "Dev" ? err.stack : undefined,
  });
};

export const successResponse = ({ res, statusCode, message, data }) => {
  return res.status(statusCode || 200).json({
    message: message || "Success",
    data: data || undefined,
  });
};
