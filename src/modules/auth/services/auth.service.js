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
import { PROVIDERS_ENUM } from "../../../lib/constants/constants.js";
import emailEvent from "../../../lib/utils/events/email.event.js";
import { customAlphabet } from "nanoid";

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

// Login service
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await findOne({
    model: UserModel,
    filters: { email, providers: PROVIDERS_ENUM.SYSTEM },
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
  const updatedUser = await updateOne({
    model: UserModel,
    filters: { email },
    data: {
      confirmEmail: new Date(),
      $unset: { confirmEmailOtp: 1 },
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
    data: {},
  });
});
