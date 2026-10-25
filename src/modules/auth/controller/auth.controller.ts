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
} from "../services/auth.service";
import {
  confirmEmailSchema,
  googleAuthSchema,
  loginSchema,
  resendConfirmEmailSchema,
  resetPasswordSchema,
  sendForgotPasswordOtpSchema,
  signupSchema,
  verifyForgotPasswordOtpSchema,
} from "../schema/auth.schema";
import { validationMiddleware } from "../../../middleware/validation.middleware.js";

const authRouter = Router({
  caseSensitive: true,
  strict: true,
});
/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userName
 *               - email
 *               - password
 *               - confirmPassword
 *               - gender
 *               - phoneNumber
 *             properties:
 *               userName:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: "SecurePass123"
 *               confirmPassword:
 *                 type: string
 *                 example: "SecurePass123"
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *                 example: "male"
 *               phoneNumber:
 *                 type: string
 *                 example: "+1234567890"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *       400:
 *         description: Validation error or user already exists
 *       409:
 *         description: Email or phone number already in use
 */
authRouter.post("/signup", validationMiddleware(signupSchema), signup);
/**
 * @swagger
 * /auth/confirm-email:
 *   patch:
 *     summary: Confirm email with OTP
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Email confirmed successfully
 *       400:
 *         description: Invalid or expired OTP
 *       404:
 *         description: User not found
 */
authRouter.patch(
  "/confirm-email",
  validationMiddleware(confirmEmailSchema),
  confirmEmail,
);
/**
 * @swagger
 * /auth/resend-confirm-email-otp:
 *   patch:
 *     summary: Resend email confirmation OTP
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *       400:
 *         description: Too many OTP attempts
 *       404:
 *         description: User not found
 */
authRouter.patch(
  "/resend-confirm-email-otp",
  validationMiddleware(resendConfirmEmailSchema),
  resendConfirmEmail,
);
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *                     user:
 *                       type: object
 *       400:
 *         description: Invalid credentials or account frozen
 *       404:
 *         description: User not found
 */
authRouter.post("/login", validationMiddleware(loginSchema), login);
/**
 * @swagger
 * /auth/signup-google:
 *   post:
 *     summary: Sign up or login with Google
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *                 description: Google OAuth ID token
 *     responses:
 *       200:
 *         description: Google authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *                     user:
 *                       type: object
 *       400:
 *         description: Invalid Google token
 */
authRouter.post(
  "/signup-google",
  validationMiddleware(googleAuthSchema),
  googleLoginOrSignup,
);
/**
 * @swagger
 * /auth/send-forgot-password-otp:
 *   patch:
 *     summary: Send OTP for password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Too many OTP attempts
 *       404:
 *         description: User not found
 */
authRouter.patch(
  "/send-forgot-password-otp",
  validationMiddleware(sendForgotPasswordOtpSchema),
  sendForgotPasswordOtp,
);
/**
 * @swagger
 * /auth/verify-forgot-password-otp:
 *   patch:
 *     summary: Verify OTP for password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid or expired OTP
 *       404:
 *         description: User not found
 */
authRouter.patch(
  "/verify-forgot-password-otp",
  validationMiddleware(verifyForgotPasswordOtpSchema),
  verifyForgotPasswordOtp,
);
/**
 * @swagger
 * /auth/reset-password:
 *   patch:
 *     summary: Reset password with verified OTP
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - password
 *               - confirmPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               otp:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid OTP or password mismatch
 *       404:
 *         description: User not found
 */
authRouter.patch(
  "/reset-password",
  validationMiddleware(resetPasswordSchema),
  resetPassword,
);
/**
 * @swagger
 * /auth/login-google:
 *   post:
 *     summary: Login with Google (existing users only)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *                 description: Google OAuth ID token
 *     responses:
 *       200:
 *         description: Google login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *                     user:
 *                       type: object
 *       400:
 *         description: Invalid Google token or user not found
 */
authRouter.post(
  "/login-google",
  validationMiddleware(googleAuthSchema),
  googleLogin,
);

export default authRouter;
