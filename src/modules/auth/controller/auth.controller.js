import { Router } from "express";
import { login, refreshToken, signup } from "../services/auth.service.js";
import { authMiddleware } from "../../../middleware/authentication.middleware.js";
import { TOKEN_TYPES_ENUM } from "../../../lib/constants/constants.js";

const authRouter = Router();
authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.get(
  "/refresh-token",
  authMiddleware({ tokenType: TOKEN_TYPES_ENUM.REFRESH }),
  refreshToken,
);
export default authRouter;
