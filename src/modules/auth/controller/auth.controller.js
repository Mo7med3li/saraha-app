import { Router } from "express";
import { TOKEN_TYPES_ENUM } from "../../../lib/constants/constants.js";
import { authMiddleware } from "../../../middleware/authentication.middleware.js";
import {
  googleLogin,
  googleLoginOrSignup,
  login,
  refreshToken,
  signup,
  confirmEmail,
  resendConfirmEmail,
} from "../services/auth.service.js";
import {
  confirmEmailSchema,
  googleAuthSchema,
  loginSchema,
  refreshTokenSchema,
  resendConfirmEmailSchema,
  signupSchema,
} from "../schema/auth.schema.js";
import { validationMiddleware } from "../../../middleware/validation.middleware.js";

const authRouter = Router();
authRouter.post("/signup", validationMiddleware(signupSchema), signup);
authRouter.patch(
  "/confirm-email",
  validationMiddleware(confirmEmailSchema),
  confirmEmail,
);
authRouter.patch(
  "/resend-confirm-email-otp",
  validationMiddleware(resendConfirmEmailSchema),
  resendConfirmEmail,
);
authRouter.post("/login", validationMiddleware(loginSchema), login);
authRouter.post(
  "/signup-google",
  validationMiddleware(googleAuthSchema),
  googleLoginOrSignup,
);
authRouter.post(
  "/login-google",
  validationMiddleware(googleAuthSchema),
  googleLogin,
);

authRouter.get(
  "/refresh-token",
  validationMiddleware(refreshTokenSchema),
  authMiddleware({ tokenType: TOKEN_TYPES_ENUM.REFRESH }),
  refreshToken,
);
export default authRouter;
