"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const schema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(["development", "test", "production"]).default("development"),
    PORT: zod_1.z.coerce.number().int().positive().default(3000),
    DATABASE_URL: zod_1.z.string().min(1),
    CORS_ORIGINS: zod_1.z.string().default("http://localhost:8081"),
    ACCESS_TOKEN_SECRET: zod_1.z.string().min(32).default("development-only-change-this-access-secret"),
    REFRESH_TOKEN_SECRET: zod_1.z.string().min(32).default("development-only-change-this-refresh-secret"),
    ACCESS_TOKEN_TTL_SECONDS: zod_1.z.coerce.number().int().positive().default(900),
    REFRESH_TOKEN_TTL_DAYS: zod_1.z.coerce.number().int().positive().default(30),
    DELIVERY_FEE_RWF: zod_1.z.coerce.number().int().nonnegative().default(1000),
    FLUTTERWAVE_SECRET_KEY: zod_1.z.string().optional(),
    FLUTTERWAVE_WEBHOOK_SECRET: zod_1.z.string().optional(),
});
exports.env = schema.parse(process.env);
if (exports.env.NODE_ENV === "production" && (exports.env.ACCESS_TOKEN_SECRET.includes("development-only") || exports.env.REFRESH_TOKEN_SECRET.includes("development-only"))) {
    throw new Error("Production token secrets must be configured");
}
//# sourceMappingURL=env.js.map