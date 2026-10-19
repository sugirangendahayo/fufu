"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRateLimit = void 0;
const attempts = new Map();
/** In-memory limiter is intentionally only appropriate for a single application instance. */
const authRateLimit = (req, res, next) => {
    if (!['/login', '/register', '/refresh', '/phone-verifications', '/verify-phone'].includes(req.path))
        return next();
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();
    const existing = attempts.get(key);
    const attempt = !existing || existing.resetAt < now
        ? { count: 0, resetAt: now + 15 * 60_000 }
        : existing;
    attempt.count += 1;
    attempts.set(key, attempt);
    if (attempt.count > 20) {
        return res.status(429).json({ error: { code: "RATE_LIMITED", message: "Too many authentication attempts; try again later" } });
    }
    next();
};
exports.authRateLimit = authRateLimit;
//# sourceMappingURL=auth-rate-limit.js.map