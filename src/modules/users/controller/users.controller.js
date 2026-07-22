import { Router } from "express";
import { getUserById } from "../services/users.service.js";

const usersRouter = Router();

usersRouter.get("/profile/:id", getUserById);

export default usersRouter;
