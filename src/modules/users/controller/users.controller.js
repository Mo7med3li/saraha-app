import { Router } from "express";

const usersRouter = Router();

usersRouter.get("/", (req, res) => {
  res.send("Hello World");
});

export default usersRouter;
