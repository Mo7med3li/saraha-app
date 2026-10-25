import { Router } from "express";
import {
  authMiddleware,
  authorizeMiddleware,
} from "../../../middleware/authentication.middleware";
import {
  getUserById,
  getUserSharedData,
  freezeAccount,
  updateUserInfo,
  restoreAccount,
  deleteAccount,
  updatePassword,
  logout,
  refreshToken,
  profileImageUpload,
  profileGalleryUpload,
  getAllUsers,
} from "../services/users.service";
import { authorize } from "../../../authorize/authorize";
import {
  deleteAccountSchema,
  freezeAccountSchema,
  logoutSchema,
  profileGallerySchema,
  profileImageSchema,
  refreshTokenSchema,
  restoreAccountSchema,
  updatePasswordSchema,
  userSharedDataSchema,
  userUpdateInfoSchema,
} from "../schema/user.schema";
import { validationMiddleware } from "../../../middleware/validation.middleware";
import {
  FILE_FILTER_VALIDATION,
  TOKEN_TYPES_ENUM,
} from "../../../lib/constants/constants";
import { cloudinaryFileUpload } from "../../../lib/utils/multer/cloud.multer";

const usersRouter: Router = Router({
  caseSensitive: true,
  strict: true,
});

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *       - systemAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
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
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
usersRouter.get(
  "/profile",
  authMiddleware(),
  authorizeMiddleware({ roles: authorize.profile as string[] }),
  getUserById,
);

/**
 * @swagger
 * /users/refresh-token:
 *   get:
 *     summary: Refresh access token using refresh token
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *       - systemAuth: []
 *     responses:
 *       200:
 *         description: Token refreshed successfully
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
 *       401:
 *         description: Invalid or expired refresh token
 */
usersRouter.get(
  "/refresh-token",
  validationMiddleware(refreshTokenSchema),
  authMiddleware({ tokenType: TOKEN_TYPES_ENUM.REFRESH }),
  refreshToken,
);
/**
 * @swagger
 * /users/all:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *       - systemAuth: []
 *     responses:
 *       200:
 *         description: All users retrieved successfully
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
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
usersRouter.get(
  "/all",
  authMiddleware(),
  authorizeMiddleware({ roles: authorize.getAllUsers as string[] }),
  getAllUsers,
);
/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get public user data by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User data retrieved successfully
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
 *       404:
 *         description: User not found
 */
usersRouter.get(
  "/:id",
  validationMiddleware(userSharedDataSchema),
  getUserSharedData,
);

/**
 * @swagger
 * /users/:
 *   patch:
 *     summary: Update current user information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *       - systemAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *                 example: "John Doe"
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *               phoneNumber:
 *                 type: string
 *                 example: "+1234567890"
 *     responses:
 *       200:
 *         description: User info updated successfully
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
 *         description: Validation error or no data to update
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Username already exists
 */
usersRouter.patch(
  "/",
  authMiddleware(),
  validationMiddleware(userUpdateInfoSchema),
  updateUserInfo,
);

/**
 * @swagger
 * /users/update-password:
 *   patch:
 *     summary: Update current user password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *       - systemAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - password
 *               - confirmPassword
 *               - flag
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 format: password
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *               confirmPassword:
 *                 type: string
 *               flag:
 *                 type: string
 *                 enum: [SIGNED_OUT_FROM_ALL, SIGNED_OUT_FROM_CURRENT_DEVICE]
 *                 description: Logout flag after password update
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Validation error or old password incorrect
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Password cannot be the same as previous passwords
 */
usersRouter.patch(
  "/update-password",
  authMiddleware(),
  validationMiddleware(updatePasswordSchema),
  updatePassword,
);

/**
 * @swagger
 * /users/logout:
 *   post:
 *     summary: Logout current user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *       - systemAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               flag:
 *                 type: string
 *                 enum: [SIGNED_OUT_FROM_ALL, SIGNED_OUT_FROM_CURRENT_DEVICE]
 *                 description: Logout from all devices or current device only
 *     responses:
 *       200:
 *         description: Logged out from current device
 *       201:
 *         description: Logged out from all devices
 *       401:
 *         description: Unauthorized
 */
usersRouter.post(
  "/logout",
  authMiddleware(),
  validationMiddleware(logoutSchema),
  logout,
);

/**
 * @swagger
 * /users/{id}/freeze-account:
 *   delete:
 *     summary: Freeze a user account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *       - systemAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to freeze (optional - if not provided, freezes own account)
 *     responses:
 *       200:
 *         description: Account frozen successfully
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
 *         description: Failed to freeze account or account already frozen
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to freeze this account
 */
usersRouter.delete(
  "/:id/freeze-account",
  authMiddleware(),
  validationMiddleware(freezeAccountSchema),
  freezeAccount,
);
/**
 * @swagger
 * /users/{id}/restore-account:
 *   patch:
 *     summary: Restore a frozen user account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *       - systemAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to restore
 *     responses:
 *       200:
 *         description: Account restored successfully
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
 *         description: Failed to restore account or account not frozen
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
usersRouter.patch(
  "/:id/restore-account",
  authMiddleware(),
  authorizeMiddleware({ roles: authorize.restoreAccount }),
  validationMiddleware(restoreAccountSchema),
  restoreAccount,
);
/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Permanently delete a frozen user account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *       - systemAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to delete
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *       400:
 *         description: Failed to delete account or account not frozen
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
usersRouter.delete(
  "/:id",
  authMiddleware(),
  authorizeMiddleware({ roles: authorize.deleteAccount }),
  validationMiddleware(deleteAccountSchema),
  deleteAccount,
);

/**
 * @swagger
 * /users/profile-image:
 *   patch:
 *     summary: Upload or update profile image
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *       - systemAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - profileImage
 *             properties:
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: Profile image file
 *     responses:
 *       200:
 *         description: Profile image uploaded successfully
 *       400:
 *         description: No image uploaded or upload failed
 *       401:
 *         description: Unauthorized
 */
usersRouter.patch(
  "/profile-image",
  authMiddleware(),
  cloudinaryFileUpload({
    filterValidation: FILE_FILTER_VALIDATION.image,
  }).single("profileImage"),
  validationMiddleware(profileImageSchema),
  profileImageUpload,
);

/**
 * @swagger
 * /users/profile-gallery:
 *   patch:
 *     summary: Update profile gallery images
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *       - systemAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profileGallery:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 maxItems: 5
 *                 description: Profile gallery images (max 5)
 *               existingImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: URLs of existing images to keep
 *     responses:
 *       200:
 *         description: Profile gallery updated successfully
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
 *         description: No images provided or upload failed
 *       401:
 *         description: Unauthorized
 */
usersRouter.patch(
  "/profile-gallery",
  authMiddleware(),
  cloudinaryFileUpload({
    filterValidation: FILE_FILTER_VALIDATION.image,
  }).array("profileGallery", 5), // 5 images max
  validationMiddleware(profileGallerySchema),
  profileGalleryUpload,
);

// usersRouter.patch(
//   "/profile-gallery-and-certifications",
//   authMiddleware(),
//   localFileUpload({
//     customPath: "users",
//     filterValidation: [
//       ...FILE_FILTER_VALIDATION.image,
//       FILE_FILTER_VALIDATION.document[0],
//     ],
//   }).fields([
//     { name: "profileGallery", maxCount: 10 },
//     { name: "certifications", maxCount: 2 },
//   ]), // 10 images max
//   profileGalleryAndCertificationsUpload,
// );
export default usersRouter;
