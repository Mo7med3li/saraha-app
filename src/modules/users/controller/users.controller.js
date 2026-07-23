import { Router } from "express";
import { getUserById } from "../services/users.service.js";
import { authMiddleware } from "../../../middleware/authentication.middleware.js";

const usersRouter = Router();

usersRouter.get("/profile", authMiddleware(), getUserById);

export default usersRouter;
