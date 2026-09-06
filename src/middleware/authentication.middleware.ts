import type { NextFunction, Request, Response } from "express";
import { TOKEN_TYPES_ENUM } from "../lib/constants/constants";
import { asyncHandler } from "../lib/utils/response.js";
import { decodeToken } from "../lib/utils/security/token.security";

export const authMiddleware = ({
  tokenType = TOKEN_TYPES_ENUM.ACCESS,
}: {
  tokenType?: (typeof TOKEN_TYPES_ENUM)[keyof typeof TOKEN_TYPES_ENUM];
} = {}) => {
  return asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { authorization } = req.headers;

      const result = await decodeToken({
        next,
        authorization,
        tokenType,
      });
      if (!result) return;

      const { user, decoded } = result;
      if (user?.changeCredentialsTime?.getTime() > (decoded.iat ?? 0) * 1000) {
        return next(
          new Error("credentials expired, you need to login again", {
            cause: 401,
          }),
        );
      }
      req.user = user;
      req.decoded = decoded;
      next();
    },
  );
};

export const authorizeMiddleware = ({
  roles = [],
}: {
  roles?: readonly string[];
}) => {
  return asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { user } = req;
      if (!user?.role || !roles.includes(user.role)) {
        return next(new Error("unauthorized", { cause: 403 }));
      }
      next();
    },
  );
};

export const auth = ({
  tokenType = TOKEN_TYPES_ENUM.ACCESS,
  roles = [],
}: {
  tokenType?: (typeof TOKEN_TYPES_ENUM)[keyof typeof TOKEN_TYPES_ENUM];
  roles?: readonly string[];
}) => {
  return asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { authorization } = req.headers;

      const result = await decodeToken({
        next,
        authorization,
        tokenType,
      });
      if (!result) return;

      const { user, decoded } = result;
      req.user = user;
      req.decoded = decoded;

      if (!user?.role || !roles.includes(user.role)) {
        return next(new Error("unauthorized", { cause: 403 }));
      }
      next();
    },
  );
};
