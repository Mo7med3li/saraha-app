// import "dotenv/config";
import { join } from "node:path";
import { bootstrap } from "./app.controller";
import dotenv from "dotenv";

dotenv.config({
  path: join("./config/.env"),
});
// dotenv.config({});
bootstrap();
