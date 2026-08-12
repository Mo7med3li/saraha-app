import { Router } from "express";
import {
  authMiddleware,
  authorizeMiddleware,
} from "../../../middleware/authentication.middleware.js";
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
} from "../services/users.service.js";
import { authorize } from "../../../authorize/authorize.js";
import {
  deleteAccountSchema,
  freezeAccountSchema,
  logoutSchema,
  refreshTokenSchema,
  restoreAccountSchema,
  updatePasswordSchema,
  userSharedDataSchema,
  userUpdateInfoSchema,
} from "../schema/user.schema.js";
import { validationMiddleware } from "../../../middleware/validation.middleware.js";
import { TOKEN_TYPES_ENUM } from "../../../lib/constants/constants.js";
import { localFileUpload } from "../../../lib/utils/multer/local.multer.js";

const usersRouter = Router();

usersRouter.get(
  "/profile",
  authMiddleware(),
  authorizeMiddleware({ roles: authorize.profile }),
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

  localFileUpload({ customPath: "users" }).single("profileImage"),
  profileImageUpload,
);

export default usersRouter;
