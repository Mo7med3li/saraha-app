import { findAndUpdate, findOne, updateOne } from "../../../db/db.service.js";
import UserModel from "../../../db/models/user.model.js";
import { ROLES_ENUM } from "../../../lib/constants/constants.js";
import { asyncHandler, successResponse } from "../../../lib/utils/response.js";
import {
  decryption,
  encryption,
} from "../../../lib/utils/security/encryption.security.js";

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

  console.log(updatedUser);
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
