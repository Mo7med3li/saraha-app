import { OAuth2Client } from "google-auth-library";
import { createOne, findOne } from "../../../db/db.service.js";
import UserModel from "../../../db/models/user.model.js";
import { asyncHandler, successResponse } from "../../../lib/utils/response.js";
import { encryption } from "../../../lib/utils/security/encryption.security.js";
import {
  compareHashPassword,
  hashPassword,
} from "../../../lib/utils/security/hash.security.js";
import { generateTokens } from "../../../lib/utils/security/token.security.js";
import { PROVIDERS_ENUM } from "../../../lib/constants/constants.js";

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
  const hashedPassword = await hashPassword({ password });
  const encryptedPhoneNumber = encryption({
    plainText: phoneNumber,
  });
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
      },
    ],
  });
  user.password = undefined;
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

  const matched = await compareHashPassword({
    password,
    hashedPassword: user?.password,
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
export const googleSignup = asyncHandler(async (req, res, next) => {
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
    return next(new Error("email already exists", { cause: 409 }));
  }

  const [firstName, lastName] = name.split(" ");
  if (await findOne({ model: UserModel, filters: { firstName, lastName } })) {
    return next(new Error("user name already exists", { cause: 409 }));
  }
  const newUser = await createOne({
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
  return successResponse({
    res,
    statusCode: 201,
    message: "User created successfully",
    data: { userId: newUser[0].id },
  });
});
