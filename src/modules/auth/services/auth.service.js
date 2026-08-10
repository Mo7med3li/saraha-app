import { OAuth2Client } from "google-auth-library";
import { createOne, findOne, updateOne } from "../../../db/db.service.js";
import UserModel from "../../../db/models/user.model.js";
import { asyncHandler, successResponse } from "../../../lib/utils/response.js";
import { encryption } from "../../../lib/utils/security/encryption.security.js";
import {
  compareHash,
  generateHash,
} from "../../../lib/utils/security/hash.security.js";
import { generateTokens } from "../../../lib/utils/security/token.security.js";
import {
  LOGOUT_ENUM,
  PROVIDERS_ENUM,
} from "../../../lib/constants/constants.js";
import emailEvent from "../../../lib/utils/events/email.event.js";
import { customAlphabet } from "nanoid";
import TokenModel from "../../../db/models/token.model.js";

const OTP_MAX_ATTEMPTS = 5;
const OTP_BLOCK_MS = 1000 * 60 * 5;
const OTP_TTL_MS = 1000 * 60 * 2;

// Signup service
export const signup = asyncHandler(async (req, res, next) => {
  const { userName, email, password, gender, phoneNumber } = req.body;
  const [firstName, lastName] = userName.split(" ");

  //   Check if user name already exists
  if (await findOne({ model: UserModel, filters: { firstName, lastName } })) {
    return next(new Error("user name already exists", { cause: 409 }));
  }

  //   Check if email already exists
  if (await findOne({ model: UserModel, filters: { email } })) {
    return next(new Error("email already exists", { cause: 409 }));
  }
  const hashedPassword = await generateHash({ plainText: password });
  const encryptedPhoneNumber = encryption({
    plainText: phoneNumber,
  });
  const otp = customAlphabet("0123456789", 6)();
  const confirmEmailOtp = await generateHash({ plainText: otp });
  //   Create user
  const [user] = await createOne({
    model: UserModel,
    data: [
      {
        userName,
        email,
        password: hashedPassword,
        gender,
        phoneNumber: encryptedPhoneNumber,
        confirmEmailOtp,
        confirmEmailOtpExpiresAt: new Date(Date.now() + OTP_TTL_MS),
        confirmEmailOtpAttempts: 1,
      },
    ],
  });
  user.password = undefined;
  user.phoneNumber = undefined;
  emailEvent.emit("send-email", {
    to: email,
    subject: "Confirmation Email",
    otp,
    userName: firstName,
  });
  return successResponse({
    res,
    statusCode: 201,
    message: "User created successfully",
    data: { user },
  });
});

export const logout = asyncHandler(async (req, res, next) => {
  const { decoded } = req;

  let statusCode = 200;

  switch (req.body?.flag) {
    case LOGOUT_ENUM.SIGNED_OUT_FROM_ALL:
      await updateOne({
        model: UserModel,
        filters: { _id: decoded._id },
        data: { changeCredentialsTime: new Date() },
      });
      break;
    default:
      await createOne({
        model: TokenModel,
        data: [
          {
            jti: decoded.jti,
            userId: decoded._id,
            expiresAt:
              decoded.iat + Number(process.env.ACCESS_TOKEN_EXPIRATION_TIME),
          },
        ],
      });
      statusCode = 201;
      break;
  }

  return successResponse({
    res,
    statusCode,
    message: "User logged out successfully",
  });
});

// Login service
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await findOne({
    model: UserModel,
    filters: {
      email,
      providers: PROVIDERS_ENUM.SYSTEM,
      deletedAt: { $exists: false },
    },
  });

  if (!user) {
    return next(new Error("invalid email or password", { cause: 404 }));
  }

  if (!user.confirmEmail) {
    return next(new Error("please confirm your email", { cause: 400 }));
  }

  const matched = await compareHash({
    plainText: password,
    hash: user?.password,
  });
  if (!matched) {
    return next(new Error("invalid email or password", { cause: 404 }));
  }

  const { accessToken, refreshToken } = await generateTokens({ user });
  return successResponse({
    res,
    statusCode: 200,
    message: "Login successful",
    data: { accessToken, refreshToken },
  });
});

export const refreshToken = asyncHandler(async (req, res, next) => {
  const { user } = req;

  const { accessToken, refreshToken } = await generateTokens({ user });
  return successResponse({
    res,
    statusCode: 200,
    message: "Refresh token generated successfully",
    data: { accessToken, refreshToken },
  });
});

// verify google token
async function verifyGoogleToken({ idToken }) {
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_OAUTH_CLIENT_ID.split(","),
  });
  const payload = ticket.getPayload();

  return payload;
}

// google login service
export const googleLogin = asyncHandler(async (req, res, next) => {
  const { idToken } = req.body;

  const { email, email_verified } = await verifyGoogleToken({
    idToken,
  });
  if (!email_verified) {
    return next(new Error("email not verified", { cause: 400 }));
  }

  const user = await findOne({
    model: UserModel,
    filters: { email, providers: PROVIDERS_ENUM.GOOGLE },
  });
  if (!user) {
    return next(new Error("invalid provider or invalid email", { cause: 404 }));
  }
  const { accessToken, refreshToken } = await generateTokens({ user });
  return successResponse({
    res,
    statusCode: 200,
    message: "Login successful",
    data: { accessToken, refreshToken },
  });
});

// google signup service
export const googleLoginOrSignup = asyncHandler(async (req, res, next) => {
  const { idToken } = req.body;

  const { email, name, picture, email_verified } = await verifyGoogleToken({
    idToken,
  });
  if (!email_verified) {
    return next(new Error("email not verified", { cause: 400 }));
  }

  const user = await findOne({
    model: UserModel,
    filters: { email },
  });
  if (user) {
    if (user.providers === PROVIDERS_ENUM.GOOGLE) {
      // const { accessToken, refreshToken } = await generateTokens({ user });
      // return successResponse({
      //   res,
      //   statusCode: 200,
      //   message: "Login successful",
      //   data: { accessToken, refreshToken },
      // });

      return await googleLogin(req, res, next);
    }
    return next(new Error("email already exists", { cause: 409 }));
  }
  const [newUser] = await createOne({
    model: UserModel,
    data: [
      {
        email,
        userName: name,
        confirmEmail: new Date(),
        picture,
        providers: PROVIDERS_ENUM.GOOGLE,
      },
    ],
  });
  const { accessToken, refreshToken } = await generateTokens({ user: newUser });
  return successResponse({
    res,
    statusCode: 201,
    message: "Signup successful",
    data: { accessToken, refreshToken },
  });
});

// confirm email service
export const confirmEmail = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;
  const user = await findOne({
    model: UserModel,
    filters: {
      email,
      confirmEmail: { $exists: false },
      confirmEmailOtp: { $exists: true },
    },
  });

  if (!user) {
    return next(
      new Error("invalid email or email already confirmed", { cause: 404 }),
    );
  }

  const matched = await compareHash({
    plainText: otp,
    hash: user?.confirmEmailOtp,
  });
  if (!matched) {
    return next(new Error("invalid otp", { cause: 404 }));
  }
  if (user.confirmEmailOtpExpiresAt < new Date(Date.now())) {
    return next(
      new Error("otp expired, please request a new otp", { cause: 400 }),
    );
  }

  const updatedUser = await updateOne({
    model: UserModel,
    filters: { email },
    data: {
      confirmEmail: new Date(),
      $unset: {
        confirmEmailOtp: 1,
        confirmEmailOtpExpiresAt: 1,
        confirmEmailOtpAttempts: 1,
        confirmEmailOtpBlockedUntil: 1,
      },
      $inc: { __v: 1 },
    },
  });
  if (!updatedUser.matchedCount) {
    return next(new Error("failed to confirm email", { cause: 400 }));
  }
  return successResponse({
    res,
    statusCode: 200,
    message: "Email confirmed successfully",
  });
});

// resend confirm email service
export const resendConfirmEmail = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const now = new Date();

  const user = await findOne({
    model: UserModel,
    filters: {
      email,
      confirmEmail: { $exists: false },
      confirmEmailOtp: { $exists: true },
    },
  });
  if (!user) {
    return next(
      new Error("invalid email or email already confirmed", { cause: 404 }),
    );
  }

  if (
    user.confirmEmailOtpBlockedUntil &&
    user.confirmEmailOtpBlockedUntil > now
  ) {
    const retryAfterSeconds = Math.ceil(
      (user.confirmEmailOtpBlockedUntil - now) / 1000,
    );
    return next(
      new Error(
        `too many otp requests, please try again in ${retryAfterSeconds} seconds`,
        { cause: 429 },
      ),
    );
  }

  if (user.confirmEmailOtpExpiresAt && user.confirmEmailOtpExpiresAt > now) {
    return next(
      new Error(
        `otp not expired, please wait for ${Math.ceil((user.confirmEmailOtpExpiresAt - now) / 1000)} seconds`,
        { cause: 400 },
      ),
    );
  }

  // Block window ended → start a fresh attempt window
  const previousAttempts =
    user.confirmEmailOtpBlockedUntil && user.confirmEmailOtpBlockedUntil <= now
      ? 0
      : user.confirmEmailOtpAttempts || 0;
  const nextAttempts = previousAttempts + 1;

  const otp = customAlphabet("0123456789", 6)();
  const confirmEmailOtp = await generateHash({ plainText: otp });

  const data = {
    confirmEmailOtp,
    confirmEmailOtpExpiresAt: new Date(now.getTime() + OTP_TTL_MS),
    confirmEmailOtpAttempts: nextAttempts,
  };

  if (nextAttempts >= OTP_MAX_ATTEMPTS) {
    data.confirmEmailOtpBlockedUntil = new Date(now.getTime() + OTP_BLOCK_MS);
  } else if (user.confirmEmailOtpBlockedUntil) {
    data.$unset = { confirmEmailOtpBlockedUntil: 1 };
  }

  const updatedUser = await updateOne({
    model: UserModel,
    filters: { email },
    data,
  });
  if (!updatedUser.matchedCount) {
    return next(new Error("failed to resend confirm email", { cause: 400 }));
  }

  emailEvent.emit("send-email", {
    to: email,
    subject: "Confirmation Email",
    otp,
    userName: user.userName,
  });

  return successResponse({
    res,
    statusCode: 200,
    message: "Confirmation email sent successfully",
  });
});

export const sendForgotPasswordOtp = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const now = new Date();

  const user = await findOne({
    model: UserModel,
    filters: {
      email,
      deletedAt: { $exists: false },
      confirmEmail: { $exists: true },
      providers: PROVIDERS_ENUM.SYSTEM,
    },
  });
  if (!user) {
    return next(new Error("invalid email or email not found", { cause: 404 }));
  }

  if (
    user.forgotPasswordOtpBlockedUntil &&
    user.forgotPasswordOtpBlockedUntil > now
  ) {
    const retryAfterSeconds = Math.ceil(
      (user.forgotPasswordOtpBlockedUntil - now) / 1000,
    );
    return next(
      new Error(
        `too many otp requests, please try again in ${retryAfterSeconds} seconds`,
        { cause: 429 },
      ),
    );
  }

  if (
    user.forgotPasswordOtpExpiresAt &&
    user.forgotPasswordOtpExpiresAt > now
  ) {
    return next(
      new Error(
        `otp not expired, please wait for ${Math.ceil((user.forgotPasswordOtpExpiresAt - now) / 1000)} seconds`,
        { cause: 400 },
      ),
    );
  }

  // Block window ended → start a fresh attempt window
  const previousAttempts =
    user.forgotPasswordOtpBlockedUntil &&
    user.forgotPasswordOtpBlockedUntil <= now
      ? 0
      : user.forgotPasswordOtpAttempts || 0;
  const nextAttempts = previousAttempts + 1;

  const otp = customAlphabet("0123456789", 6)();
  const forgotPasswordOtp = generateHash({ plainText: otp });

  const data = {
    forgotPasswordOtp,
    forgotPasswordOtpExpiresAt: new Date(now.getTime() + OTP_TTL_MS),
    forgotPasswordOtpAttempts: nextAttempts,
  };

  if (nextAttempts >= OTP_MAX_ATTEMPTS) {
    data.forgotPasswordOtpBlockedUntil = new Date(now.getTime() + OTP_BLOCK_MS);
  } else if (user.forgotPasswordOtpBlockedUntil) {
    data.$unset = { forgotPasswordOtpBlockedUntil: 1 };
  }

  const updatedUser = await updateOne({
    model: UserModel,
    filters: { _id: user._id },
    data,
  });
  if (!updatedUser.matchedCount) {
    return next(
      new Error("failed to send forgot password otp", { cause: 400 }),
    );
  }

  emailEvent.emit("send-email-forgot-password", {
    to: email,
    subject: "Forgot Password",
    otp,
    userName: user.userName,
  });

  return successResponse({
    res,
    statusCode: 200,
    message: "Forgot password otp sent successfully",
  });
});

export const verifyForgotPasswordOtp = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;
  const now = new Date();

  const user = await findOne({
    model: UserModel,
    filters: {
      email,
      deletedAt: { $exists: false },
      confirmEmail: { $exists: true },
      forgotPasswordOtp: { $exists: true },
      providers: PROVIDERS_ENUM.SYSTEM,
    },
  });
  if (!user) {
    return next(new Error("invalid email or otp", { cause: 404 }));
  }

  if (
    !user.forgotPasswordOtpExpiresAt ||
    user.forgotPasswordOtpExpiresAt < now
  ) {
    return next(
      new Error("otp expired, please request a new otp", { cause: 400 }),
    );
  }

  const comparedOtp = compareHash({
    plainText: otp,
    hash: user.forgotPasswordOtp,
  });
  if (!comparedOtp) {
    return next(new Error("invalid otp", { cause: 404 }));
  }

  return successResponse({
    res,
    statusCode: 200,
    message: "Forgot password otp verified successfully",
  });
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const { email, otp, newPassword } = req.body;
  const now = new Date();

  const user = await findOne({
    model: UserModel,
    filters: {
      email,
      forgotPasswordOtp: { $exists: true },
      deletedAt: { $exists: false },
      confirmEmail: { $exists: true },
      providers: PROVIDERS_ENUM.SYSTEM,
    },
  });
  if (!user) {
    return next(new Error("invalid email or email not found", { cause: 404 }));
  }

  if (
    !user.forgotPasswordOtpExpiresAt ||
    user.forgotPasswordOtpExpiresAt < now
  ) {
    return next(
      new Error("otp expired, please request a new otp", { cause: 400 }),
    );
  }

  const compareOtp = compareHash({
    plainText: otp,
    hash: user.forgotPasswordOtp,
  });
  if (!compareOtp) {
    return next(new Error("invalid otp", { cause: 404 }));
  }

  if (compareHash({ plainText: newPassword, hash: user.password })) {
    return next(
      new Error("Password cannot be the same as the current password", {
        cause: 409,
      }),
    );
  }

  if (user?.oldPasswords?.length) {
    for (const oldPassword of user.oldPasswords) {
      if (compareHash({ plainText: newPassword, hash: oldPassword })) {
        return next(
          new Error("Password cannot be the same as the previous passwords", {
            cause: 409,
          }),
        );
      }
    }
  }

  const updatedUser = await updateOne({
    model: UserModel,
    filters: {
      _id: user._id,
      forgotPasswordOtp: { $exists: true },
    },
    data: {
      password: generateHash({ plainText: newPassword }),
      $push: { oldPasswords: { $each: [user.password], $slice: -3 } },
      $unset: {
        forgotPasswordOtp: 1,
        forgotPasswordOtpExpiresAt: 1,
        forgotPasswordOtpAttempts: 1,
        forgotPasswordOtpBlockedUntil: 1,
      },
      $inc: { __v: 1 },
    },
  });
  if (!updatedUser.matchedCount) {
    return next(new Error("failed to reset password", { cause: 400 }));
  }

  return successResponse({
    res,
    statusCode: 200,
    message: "Password reset successfully",
  });
});
