import {
  deleteOne,
  findAndUpdate,
  findOne,
  updateOne,
} from "../../../db/db.service.js";
import UserModel from "../../../db/models/user.model.js";
import { LOGOUT_ENUM, ROLES_ENUM } from "../../../lib/constants/constants.js";
import { asyncHandler, successResponse } from "../../../lib/utils/response.js";
import {
  decryption,
  encryption,
} from "../../../lib/utils/security/encryption.security.js";
import {
  compareHash,
  generateHash,
} from "../../../lib/utils/security/hash.security.js";
import { createRevokedToken } from "../../../lib/utils/security/token.security.js";

// Get user by ID service
export const getUserById = asyncHandler(async (req, res, next) => {
  const { user } = req;
  user.phoneNumber = decryption({
    cipherText: user.phoneNumber,
  });

  return successResponse({
    res,
    statusCode: 200,
    message: "User fetched successfully",
    data: { user },
  });
});

export const getUserSharedData = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await findOne({
    model: UserModel,
    filters: { _id: id, confirmEmail: { $exists: true } },
    select: "-password -confirmEmailOtpAttempts",
  });
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }
  user.phoneNumber = decryption({
    cipherText: user.phoneNumber,
  });

  return successResponse({
    res,
    statusCode: 200,
    message: "User data fetched successfully",
    data: { user },
  });
});

export const updateUserInfo = asyncHandler(async (req, res, next) => {
  const { user } = req;
  const { userName, gender, phoneNumber } = req.body;

  // userName is a virtual — update firstName/lastName instead
  const data = {};
  if (userName) {
    const [firstName, lastName] = userName.split(" ");
    if (await findOne({ model: UserModel, filters: { firstName, lastName } })) {
      return next(new Error("user name already exists", { cause: 409 }));
    }
    data.firstName = firstName;
    data.lastName = lastName;
  }

  if (gender) data.gender = gender;
  if (phoneNumber) {
    data.phoneNumber = encryption({ plainText: phoneNumber });
  }

  if (Object.keys(data).length === 0) {
    return next(new Error("No data to update", { cause: 400 }));
  }

  const updatedUser = await findAndUpdate({
    model: UserModel,
    filters: { _id: user._id },
    data,
    select: "-password -confirmEmailOtpAttempts",
  });
  if (!updatedUser) {
    return next(new Error("Failed to update user info", { cause: 400 }));
  }
  updatedUser.phoneNumber = decryption({
    cipherText: updatedUser.phoneNumber,
  });

  return successResponse({
    res,
    statusCode: 200,
    message: "User info updated successfully",
    data: { user: updatedUser },
  });
});

export const freezeAccount = asyncHandler(async (req, res, next) => {
  const { user } = req;
  const { id } = req.params;

  if (id && user.role !== ROLES_ENUM.ADMIN) {
    return next(
      new Error("You are not authorized to freeze this account", {
        cause: 403,
      }),
    );
  }

  const updatedUser = await findAndUpdate({
    model: UserModel,
    filters: { _id: id || user._id, deletedAt: { $exists: false } },
    data: {
      deletedAt: new Date(),
      deletedBy: user._id,
      changeCredentialsTime: new Date(),
      $unset: {
        restoredAt: 1,
        restoredBy: 1,
      },
    },
    select: "-password -confirmEmailOtpAttempts",
  });
  if (!updatedUser) {
    return next(
      new Error("Failed to freeze account or account already frozen", {
        cause: 400,
      }),
    );
  }

  return successResponse({
    res,
    statusCode: 200,
    message: "Account frozen successfully",
    data: { user: updatedUser },
  });
});

export const restoreAccount = asyncHandler(async (req, res, next) => {
  const { user } = req;
  const { id } = req.params;

  const updatedUser = await findAndUpdate({
    model: UserModel,
    filters: {
      _id: id,
      deletedAt: { $exists: true },
      // to prevent the admin to restore user account the freezed from the user himself
      deletedBy: { $ne: id },
    },
    data: {
      $unset: {
        deletedAt: 1,
        deletedBy: 1,
      },
      $set: {
        restoredAt: new Date(),
        restoredBy: user._id,
      },
    },
    select: "-password -confirmEmailOtpAttempts",
  });

  if (!updatedUser) {
    return next(
      new Error("Failed to restore account or account not freezed", {
        cause: 400,
      }),
    );
  }

  return successResponse({
    res,
    statusCode: 200,
    message: "Account restored successfully",
    data: { user: updatedUser },
  });
});

export const deleteAccount = asyncHandler(async (req, res, next) => {
  const { user } = req;
  const { id } = req.params;

  const deletedUser = await deleteOne({
    model: UserModel,
    filters: { _id: id, deletedAt: { $exists: true } },
  });
  if (!deletedUser.deletedCount) {
    return next(
      new Error("Failed to delete account or account not freezed", {
        cause: 400,
      }),
    );
  }

  return successResponse({
    res,
    statusCode: 200,
    message: "Account deleted successfully",
  });
});

export const updatePassword = asyncHandler(async (req, res, next) => {
  const { user } = req;
  const { oldPassword, password, flag } = req.body;
  let updatedData = {};
  if (!compareHash({ plainText: oldPassword, hash: user.password })) {
    return next(new Error("Old password is incorrect", { cause: 400 }));
  }

  if (user?.oldPasswords?.length) {
    for (const oldPassword of user.oldPasswords) {
      if (await compareHash({ plainText: password, hash: oldPassword })) {
        return next(
          new Error("Password cannot be the same as the previous passwords", {
            cause: 409,
          }),
        );
      }
    }
  }
  switch (flag) {
    case LOGOUT_ENUM.SIGNED_OUT_FROM_ALL:
      updatedData.changeCredentialsTime = new Date();
      break;
    case LOGOUT_ENUM.SIGNED_OUT_FROM_CURRENT_DEVICE:
      await createRevokedToken({ decoded: req.decoded });
      break;
    default:
      break;
  }
  const updatedUser = await findAndUpdate({
    model: UserModel,
    filters: { _id: user._id },
    data: {
      password: await generateHash({ plainText: password }),
      ...updatedData,
      $push: { oldPasswords: { $each: [user.password], $slice: -3 } },
    },
    select: "-password -confirmEmailOtpAttempts",
  });
  if (!updatedUser) {
    return next(new Error("Failed to update password", { cause: 400 }));
  }
  return successResponse({
    res,
    statusCode: 200,
    message: "Password updated successfully",
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
      await createRevokedToken({ decoded });
      statusCode = 201;
      break;
  }

  return successResponse({
    res,
    statusCode,
    message: "User logged out successfully",
  });
});
