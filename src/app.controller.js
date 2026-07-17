import express from "express";
import userRouter from "./modules/users/controller/users.controller.js";
import authRouter from "./modules/auth/controller/auth.controller.js";
import connectionMongoDB from "./db/connection.db.js";
import messagesRouter from "./modules/messages/controller/messages.controller.js";
export const bootstrap = () => {
  const app = express();
  const port = 3000;
  app.use(express.json());

  //   root route
  app.get("/", (req, res) => {
    res.json({ message: "welcome to the application" });
  });
  // connect to database
  connectionMongoDB();

  //   root route
  app.get("/", (req, res) => {
    res.json({ message: "welcome to the application" });
  });
  //  auth route
  app.use("/auth", authRouter);

  //   users route
  app.use("/users", userRouter);

  //   messages route
  app.use("/messages", messagesRouter);

  //   all other routes
  app.all("{/*dummy}", (req, res) => {
    res.status(404).json({ message: "route not found" });
  });

  //   start the server
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};
