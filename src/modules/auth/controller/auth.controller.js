import { Router } from "express";
import { TOKEN_TYPES_ENUM } from "../../../lib/constants/constants.js";
import { authMiddleware } from "../../../middleware/authentication.middleware.js";
import {
  googleLogin,
  googleSignup,
  login,
  refreshToken,
  signup,
} from "../services/auth.service.js";

const authRouter = Router();
authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.post("/signup-google", googleSignup);
authRouter.post("/login-google", googleLogin);

authRouter.get(
  "/refresh-token",
  authMiddleware({ tokenType: TOKEN_TYPES_ENUM.REFRESH }),
  refreshToken,
);
export default authRouter;
