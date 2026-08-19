import cors from "cors";
import express from "express";
import connectionMongoDB from "./db/connection.db.js";
import { globalErrorHandler } from "./lib/utils/response.js";
import authRouter from "./modules/auth/controller/auth.controller.js";
import messagesRouter from "./modules/messages/controller/messages.controller.js";
import userRouter from "./modules/users/controller/users.controller.js";
import path from "path";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
export const bootstrap = async () => {
  const app = express();
  const port = process.env.PORT || 5000;
  app.use(express.json());

  // to secure the headers
  app.use(helmet());

  const limiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    limit: 2000, // limit each IP to 2000 requests per windowMs
    message: "Too many requests, please try again later.",
    // legacyHeaders: false,
  });

  app.use(limiter);

  // to detect the request and response time
  app.use(morgan("dev"));
  // CORS
  app.use(cors());

  // serve static files
  app.use("/uploads", express.static(path.resolve("./src/uploads")));
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
  // error handler
  app.use(globalErrorHandler);
  //   start the server
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};
