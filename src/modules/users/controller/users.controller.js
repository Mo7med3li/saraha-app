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
} from "../services/users.service.js";
import { authorize } from "../../../authorize/authorize.js";
import {
  freezeAccountSchema,
  userSharedDataSchema,
  userUpdateInfoSchema,
} from "../schema/user.schema.js";
import { validationMiddleware } from "../../../middleware/validation.middleware.js";

const usersRouter = Router();

usersRouter.get(
  "/profile",
  authMiddleware(),
  authorizeMiddleware({ roles: authorize.profile }),
  getUserById,
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

usersRouter.delete(
  "{/:id}/freeze-account",
  authMiddleware(),
  validationMiddleware(freezeAccountSchema),
  freezeAccount,
);

export default usersRouter;
