"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const database_1 = require("./config/database");
const env_1 = require("./config/env");
const modules_1 = require("./modules");
const http_1 = require("./lib/http");
const auth_rate_limit_1 = require("./middleware/auth-rate-limit");
exports.app = (0, express_1.default)();
exports.app.disable("x-powered-by");
exports.app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "no-referrer");
    next();
});
exports.app.use((0, cors_1.default)({
    origin: env_1.env.CORS_ORIGINS.split(",").map((origin) => origin.trim()),
    credentials: false,
}));
exports.app.use(express_1.default.json({ limit: "100kb" }));
exports.app.use("/api/v1/auth", auth_rate_limit_1.authRateLimit);
exports.app.get("/health", async (_req, res) => {
    try {
        await database_1.prisma.$queryRaw `SELECT 1`;
        res.json({ status: "ok", database: "connected" });
    }
    catch (error) {
        console.error("Database connection failed:", error);
        res.status(500).json({ status: "error", database: "disconnected" });
    }
});
exports.app.use("/api/v1", modules_1.apiRouter);
exports.app.use(http_1.notFound);
exports.app.use(http_1.errorHandler);
//# sourceMappingURL=app.js.map