import { join } from "node:path";
import dotenv from "dotenv";
dotenv.config({ path: join("./config/.env") });
dotenv.config();

import express, { json, type Express } from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { resolve } from "path";
import connectionMongoDB from "../src/db/connection.db";
import { globalErrorHandler } from "../src/lib/utils/response";
import authRouter from "../src/modules/auth/controller/auth.controller";
import messagesRouter from "../src/modules/messages/controller/messages.controller";
import userRouter from "../src/modules/users/controller/users.controller";

const app: Express = express();

app.set("trust proxy", 1);
app.use(json());
app.use(helmet());

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 2000,
  message: "Too many requests, please try again later.",
});

app.use(limiter);
app.use(morgan("dev"));
app.use(cors());

app.use("/uploads", express.static(resolve("./src/uploads")));

app.get("/", (req, res) => {
  res.json({ message: "welcome to the application" });
});

connectionMongoDB();

app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/messages", messagesRouter);

app.all("{/*dummy}", (req, res) => {
  res.status(404).json({ message: "route not found" });
});

app.use(globalErrorHandler);

export default app;
