import { Router } from "express";

const authRouter = Router();
authRouter.post("/signup", (req, res) => {
  res.send("Hello World");
});

export default authRouter;
