import { findById } from "../db/db.service.js";
import UserModel from "../db/models/user.model.js";
import { ROLES_ENUM } from "../lib/constants/constants.js";
import { asyncHandler } from "../lib/utils/response.js";
import {
  getSignature,
  verifyToken,
} from "../lib/utils/security/token.security.js";

export const authMiddleware = () => {
  return asyncHandler(async (req, res, next) => {
    const { authorization } = req.headers;

    const [bearer, token] = authorization?.split(" ") || [];
    if (!token || !bearer) {
      return next(new Error("token is required", { cause: 401 }));
    }

    // get the signature based on the bearer level
    const { accessSignature } = getSignature({ bearer });
    const decodedToken = verifyToken({ token, signature: accessSignature });
    if (!decodedToken?._id) {
      return next(new Error("invalid token", { cause: 401 }));
    }
    const { _id } = decodedToken;
    const user = await findById({
      model: UserModel,
      id: _id,
      select: "-password",
    });
    if (!user) {
      return next(new Error("user not found", { cause: 404 }));
    }
    req.user = user;
    next();
  });
};
