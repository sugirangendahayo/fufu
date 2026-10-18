"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = exports.asyncHandler = exports.AppError = void 0;
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
class AppError extends Error {
    status;
    code;
    constructor(status, message, code = "REQUEST_FAILED") {
        super(message);
        this.status = status;
        this.code = code;
    }
}
exports.AppError = AppError;
const asyncHandler = (handler) => (req, res, next) => void handler(req, res, next).catch(next);
exports.asyncHandler = asyncHandler;
function errorHandler(error, _req, res, _next) {
    if (error instanceof zod_1.ZodError)
        return res.status(422).json({ error: { code: "VALIDATION_ERROR", message: "Invalid request", details: error.flatten() } });
    if (error instanceof AppError)
        return res.status(error.status).json({ error: { code: error.code, message: error.message } });
    const code = typeof error === "object" && error && "code" in error ? error.code : undefined;
    if (code === "P2002")
        return res.status(409).json({ error: { code: "CONFLICT", message: "A record with that value already exists" } });
    console.error("Unhandled request error", error);
    return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } });
}
const notFound = (_req, res) => res.status(404).json({ error: { code: "NOT_FOUND", message: "Route not found" } });
exports.notFound = notFound;
//# sourceMappingURL=http.js.map