"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const database_1 = require("./config/database");
const env_1 = require("./config/env");
const api_1 = __importDefault(require("./modules/api"));
const http_1 = require("./lib/http");
const app = (0, express_1.default)();
const PORT = env_1.env.PORT;
app.disable("x-powered-by");
app.use((_req, res, next) => { res.setHeader("X-Content-Type-Options", "nosniff"); res.setHeader("X-Frame-Options", "DENY"); res.setHeader("Referrer-Policy", "no-referrer"); next(); });
app.use((0, cors_1.default)({ origin: env_1.env.CORS_ORIGINS.split(",").map(origin => origin.trim()), credentials: false }));
app.use(express_1.default.json({ limit: "100kb" }));
const authAttempts = new Map();
app.use("/api/v1/auth", (req, res, next) => {
    if (!['/login', '/register', '/refresh'].includes(req.path))
        return next();
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();
    const current = authAttempts.get(key);
    const state = !current || current.resetAt < now ? { count: 0, resetAt: now + 15 * 60_000 } : current;
    state.count += 1;
    authAttempts.set(key, state);
    if (state.count > 20)
        return res.status(429).json({ error: { code: "RATE_LIMITED", message: "Too many authentication attempts; try again later" } });
    next();
});
app.get("/health", async (_req, res) => {
    try {
        await database_1.prisma.$queryRaw `SELECT 1`;
        res.json({
            status: "ok",
            database: "connected",
        });
    }
    catch (error) {
        console.error("Database connection failed:", error);
        res.status(500).json({
            status: "error",
            database: "disconnected",
        });
    }
});
app.use("/api/v1", api_1.default);
app.use(http_1.notFound);
app.use(http_1.errorHandler);
app.listen(PORT, () => {
    console.log(`Fufu API running at http://localhost:${PORT}`);
});
//# sourceMappingURL=server.js.map