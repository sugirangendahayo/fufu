import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1),
  CORS_ORIGINS: z.string().default("http://localhost:8081"),
  ACCESS_TOKEN_SECRET: z.string().min(32).default("development-only-change-this-access-secret"),
  REFRESH_TOKEN_SECRET: z.string().min(32).default("development-only-change-this-refresh-secret"),
  ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(900),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(30),
  DELIVERY_FEE_RWF: z.coerce.number().int().nonnegative().default(1000),
  FLUTTERWAVE_SECRET_KEY: z.string().optional(),
  FLUTTERWAVE_WEBHOOK_SECRET: z.string().optional(),
  PINDO_API_TOKEN: z.string().min(1).optional(),
  PINDO_VERIFY_BRAND: z.string().trim().min(1).max(32).default("Fufu"),
  // Set to true to bypass OTP during development when Pindo has no balance.
  // Never enable this in production.
  SKIP_PHONE_VERIFICATION: z
    .preprocess((v) => v === "true" || v === true, z.boolean())
    .default(false),
});

export const env = schema.parse(process.env);
if (env.NODE_ENV === "production" && (env.ACCESS_TOKEN_SECRET.includes("development-only") || env.REFRESH_TOKEN_SECRET.includes("development-only"))) {
  throw new Error("Production token secrets must be configured");
}
