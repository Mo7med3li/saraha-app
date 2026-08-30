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

usersRouter.get(
  "/profile",
  authMiddleware(),
  authorizeMiddleware({ roles: authorize.profile as string[] }),
  getUserById,
);

usersRouter.get(
  "/refresh-token",
  validationMiddleware(refreshTokenSchema),
  authMiddleware({ tokenType: TOKEN_TYPES_ENUM.REFRESH }),
  refreshToken,
);
usersRouter.get(
  "/:id",
  validationMiddleware(userSharedDataSchema),
  getUserSharedData,
);

usersRouter.patch(
  "/",
  authMiddleware(),
  validationMiddleware(userUpdateInfoSchema),
  updateUserInfo,
);

usersRouter.patch(
  "/update-password",
  authMiddleware(),
  validationMiddleware(updatePasswordSchema),
  updatePassword,
);

usersRouter.post(
  "/logout",
  authMiddleware(),
  validationMiddleware(logoutSchema),
  logout,
);

usersRouter.delete(
  "{/:id}/freeze-account",
  authMiddleware(),
  validationMiddleware(freezeAccountSchema),
  freezeAccount,
);
usersRouter.patch(
  "/:id/restore-account",
  authMiddleware(),
  authorizeMiddleware({ roles: authorize.restoreAccount }),
  validationMiddleware(restoreAccountSchema),
  restoreAccount,
);
usersRouter.delete(
  "/:id",
  authMiddleware(),
  authorizeMiddleware({ roles: authorize.deleteAccount }),
  validationMiddleware(deleteAccountSchema),
  deleteAccount,
);

usersRouter.patch(
  "/profile-image",
  authMiddleware(),
  cloudinaryFileUpload({
    filterValidation: FILE_FILTER_VALIDATION.image,
  }).single("profileImage"),
  validationMiddleware(profileImageSchema),
  profileImageUpload,
);

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
