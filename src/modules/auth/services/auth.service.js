import { createOne, findOne } from "../../../db/db.service.js";
import UserModel from "../../../db/models/user.model.js";
import {
  ROLES_ENUM,
  SIGNATURE_LEVEL_LABEL,
} from "../../../lib/constants/constants.js";
import { asyncHandler, successResponse } from "../../../lib/utils/response.js";
import { encryption } from "../../../lib/utils/security/encryption.security.js";
import {
  compareHashPassword,
  hashPassword,
} from "../../../lib/utils/security/hash.security.js";
import {
  generateToken,
  generateTokens,
  getSignature,
  verifyToken,
} from "../../../lib/utils/security/token.security.js";

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
    filters: { email },
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
