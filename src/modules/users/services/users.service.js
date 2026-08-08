import { findOne } from "../../../db/db.service.js";
import UserModel from "../../../db/models/user.model.js";
import { asyncHandler, successResponse } from "../../../lib/utils/response.js";
import { decryption } from "../../../lib/utils/security/encryption.security.js";

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
