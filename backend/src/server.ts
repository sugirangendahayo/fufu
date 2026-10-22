import "dotenv/config";
import { env } from "./config/env";
import { app } from "./app";
import { logger } from "./lib/logger";

const PORT = env.PORT;

app.listen(PORT, () => {
  logger.info(`Fufu API running`, { port: PORT, env: process.env.NODE_ENV ?? "development" });
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught exception", { error: String(err), stack: err.stack });
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection", { reason: String(reason) });
  process.exit(1);
});

