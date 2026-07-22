import { asyncHandler, successResponse } from "../../../lib/utils/response.js";
import UserModel from "../../../db/models/user.model.js";
import { findById } from "../../../db/db.service.js";
import { decryption } from "../../../lib/utils/security/encryption.security.js";

// Get user by ID service
export const getUserById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await findById({
    model: UserModel,
    id,
    select: "-password",
  });
  if (!user) {
    return next(new Error("user not found", { cause: 404 }));
  }
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
