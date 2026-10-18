import "dotenv/config";
import express from "express";
import cors from "cors";
import { prisma } from "./config/database";
import { env } from "./config/env";
import api from "./modules/api";
import { errorHandler, notFound } from "./lib/http";

const app = express();
const PORT = env.PORT;

app.disable("x-powered-by");
app.use((_req, res, next) => { res.setHeader("X-Content-Type-Options", "nosniff"); res.setHeader("X-Frame-Options", "DENY"); res.setHeader("Referrer-Policy", "no-referrer"); next(); });
app.use(cors({ origin: env.CORS_ORIGINS.split(",").map(origin => origin.trim()), credentials: false }));
app.use(express.json({ limit: "100kb" }));

const authAttempts = new Map<string, { count: number; resetAt: number }>();
app.use("/api/v1/auth", (req, res, next) => {
  if (!['/login', '/register', '/refresh'].includes(req.path)) return next();
  const key = `${req.ip}:${req.path}`; const now = Date.now(); const current = authAttempts.get(key);
  const state = !current || current.resetAt < now ? { count: 0, resetAt: now + 15 * 60_000 } : current;
  state.count += 1; authAttempts.set(key, state);
  if (state.count > 20) return res.status(429).json({ error: { code: "RATE_LIMITED", message: "Too many authentication attempts; try again later" } });
  next();
});

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    console.error("Database connection failed:", error);

    res.status(500).json({
      status: "error",
      database: "disconnected",
    });
  }
});

app.use("/api/v1", api);
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Fufu API running at http://localhost:${PORT}`);
});
