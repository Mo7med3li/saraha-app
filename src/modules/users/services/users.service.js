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
