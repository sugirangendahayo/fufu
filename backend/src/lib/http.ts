import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "./logger";

export class AppError extends Error { constructor(public status: number, message: string, public code = "REQUEST_FAILED") { super(message); } }
export const asyncHandler = (handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) => (req: Request, res: Response, next: NextFunction) => void handler(req, res, next).catch(next);
export function errorHandler(error: unknown, req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    logger.warn("Validation error", { path: req.path, method: req.method, details: error.flatten() });
    return res.status(422).json({ error: { code: "VALIDATION_ERROR", message: "Invalid request", details: error.flatten() } });
  }
  if (error instanceof AppError) {
    const level = error.status >= 500 ? "error" : "warn";
    logger[level]("AppError", { path: req.path, method: req.method, status: error.status, code: error.code, message: error.message });
    return res.status(error.status).json({ error: { code: error.code, message: error.message } });
  }
  const code = typeof error === "object" && error && "code" in error ? (error as { code?: string }).code : undefined;
  if (code === "P2002") {
    logger.warn("Database unique constraint violation", { path: req.path, method: req.method });
    return res.status(409).json({ error: { code: "CONFLICT", message: "A record with that value already exists" } });
  }
  // Body-parser throws a SyntaxError when the request body is malformed JSON.
  if (error instanceof SyntaxError && "body" in error) {
    logger.warn("Malformed JSON body", { path: req.path, method: req.method, error: String(error) });
    return res.status(400).json({ error: { code: "BAD_REQUEST", message: "Request body contains invalid JSON" } });
  }
  logger.error("Unhandled request error", { path: req.path, method: req.method, error: String(error) });
  return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } });
}
export const notFound = (_req: Request, res: Response) => res.status(404).json({ error: { code: "NOT_FOUND", message: "Route not found" } });
