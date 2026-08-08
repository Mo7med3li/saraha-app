import { Router } from "express";
import {
  authMiddleware,
  authorizeMiddleware,
} from "../../../middleware/authentication.middleware.js";
import { getUserById, getUserSharedData } from "../services/users.service.js";
import { authorize } from "../../../authorize/authorize.js";
import { userSharedDataSchema } from "../schema/user.schema.js";
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

export default usersRouter;
