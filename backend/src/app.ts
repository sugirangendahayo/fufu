import express from "express";
import cors from "cors";
import { prisma } from "./config/database";
import { env } from "./config/env";
import { apiRouter } from "./modules";
import { errorHandler, notFound } from "./lib/http";
import { authRateLimit } from "./middleware/auth-rate-limit";

export const app = express();
app.disable("x-powered-by");
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  next();
});
app.use(
  cors({
    origin: env.CORS_ORIGINS.split(",").map((origin) => origin.trim()),
    credentials: false,
  }),
);
app.use(express.json({ limit: "100kb" }));
app.use("/api/v1/auth", authRateLimit);
app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    console.error("Database connection failed:", error);
    res.status(500).json({ status: "error", database: "disconnected" });
  }
});
app.use("/api/v1", apiRouter);
app.use(notFound);
app.use(errorHandler);
