import { Router } from "express";
import { authMiddleware } from "../../../middleware/authentication.middleware.js";
import { getUserById } from "../services/users.service.js";

const usersRouter = Router();

usersRouter.get("/profile", authMiddleware(), getUserById);

export default usersRouter;
