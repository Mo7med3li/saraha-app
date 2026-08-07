import { Router } from "express";
import {
  authMiddleware,
  authorizeMiddleware,
} from "../../../middleware/authentication.middleware.js";
import { getUserById } from "../services/users.service.js";
import { authorize } from "../../../authorize/authorize.js";

const usersRouter = Router();

usersRouter.get(
  "/profile",
  authMiddleware(),
  authorizeMiddleware({ roles: authorize.profile }),
  getUserById,
);

export default usersRouter;
