import { TOKEN_TYPES_ENUM } from "../lib/constants/constants.js";
import { asyncHandler } from "../lib/utils/response.js";
import { decodeToken } from "../lib/utils/security/token.security.js";

export const authMiddleware = ({
  tokenType = TOKEN_TYPES_ENUM.ACCESS,
} = {}) => {
  return asyncHandler(async (req, res, next) => {
    const { authorization } = req.headers;

    const user = await decodeToken({ next, authorization, tokenType });
    req.user = user;
    next();
  });
};
