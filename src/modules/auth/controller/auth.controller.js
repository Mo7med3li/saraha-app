import { Router } from "express";
import {
  googleLogin,
  googleLoginOrSignup,
  login,
  signup,
  confirmEmail,
  resendConfirmEmail,
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetPassword,
} from "../services/auth.service.js";
import {
  confirmEmailSchema,
  googleAuthSchema,
  loginSchema,
  resendConfirmEmailSchema,
  resetPasswordSchema,
  sendForgotPasswordOtpSchema,
  signupSchema,
  verifyForgotPasswordOtpSchema,
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
authRouter.patch(
  "/send-forgot-password-otp",
  validationMiddleware(sendForgotPasswordOtpSchema),
  sendForgotPasswordOtp,
);
authRouter.patch(
  "/verify-forgot-password-otp",
  validationMiddleware(verifyForgotPasswordOtpSchema),
  verifyForgotPasswordOtp,
);
authRouter.patch(
  "/reset-password",
  validationMiddleware(resetPasswordSchema),
  resetPassword,
);
authRouter.post(
  "/login-google",
  validationMiddleware(googleAuthSchema),
  googleLogin,
);

export default authRouter;
