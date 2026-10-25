import { join } from "node:path";
import dotenv from "dotenv";

// Load env BEFORE importing the app. Otherwise swagger/config modules
// read PORT while it is still undefined and default to 5000.
dotenv.config({ path: join("./config/.env") });
dotenv.config();

async function main(): Promise<void> {
  const { bootstrap } = await import("./app.controller");
  await bootstrap();
}

main().catch((error: unknown) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
