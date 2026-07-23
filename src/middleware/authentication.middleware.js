import { findById } from "../db/db.service.js";
import UserModel from "../db/models/user.model.js";
import { asyncHandler } from "../lib/utils/response.js";
import { verifyToken } from "../lib/utils/security/token.security.js";

export const authMiddleware = () => {
  return asyncHandler(async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
      return next(new Error("token is required", { cause: 401 }));
    }
    const decodedToken = verifyToken({ token: authorization });
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
