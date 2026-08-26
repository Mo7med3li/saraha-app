import cors from "cors";
import express, { json, type Express } from "express";
import connectionMongoDB from "./db/connection.db";
import { globalErrorHandler } from "./lib/utils/response";
import authRouter from "./modules/auth/controller/auth.controller";
import messagesRouter from "./modules/messages/controller/messages.controller";
import userRouter from "./modules/users/controller/users.controller";
import { resolve } from "path";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
export const bootstrap = async (): Promise<void> => {
  const app: Express = express();
  const port = process.env.PORT || 5000;
  app.use(json());

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
  // const whitelist = process.env.CORS_ORIGIN?.split(",") || [];

  // app.use(async (req, res, next) => {
  //     if (!whitelist.includes(req.header('origin'))) {
  //         return next(new Error('Not Allowed By CORS', { status: 403 }))
  //     }
  //     for (const origin of whitelist) {
  //         if (req.header('origin') == origin) {
  //             await res.header('Access-Control-Allow-Origin', origin);
  //             break;
  //         }
  //     }
  //     await res.header('Access-Control-Allow-Headers', '*')
  //     await res.header("Access-Control-Allow-Private-Network", 'true')
  //     await res.header('Access-Control-Allow-Methods', '*')
  //     console.log("Origin Work");
  //     next();
  // });

  // const corsOptions = {
  //   origin: function (origin, callback) {
  //     if (whitelist.indexOf(origin) !== -1) {
  //       callback(null, true);
  //     } else {
  //       callback(new Error("Not allowed by CORS"));
  //     }
  //   },
  // };
  // app.use(cors(corsOptions));
  app.use(cors());

  // serve static files
  app.use("/uploads", express.static(resolve("./src/uploads")));
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
