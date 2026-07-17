import { Router } from "express";

const messagesRouter = Router();

messagesRouter.get("/", (req, res) => {
  res.send("Hello World");
});

export default messagesRouter;
