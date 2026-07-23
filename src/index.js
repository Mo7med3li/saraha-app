// import "dotenv/config";
import { bootstrap } from "./app.controller.js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.join("./src/config/.env"),
});
bootstrap();
