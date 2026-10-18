import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export class AppError extends Error { constructor(public status: number, message: string, public code = "REQUEST_FAILED") { super(message); } }
export const asyncHandler = (handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) => (req: Request, res: Response, next: NextFunction) => void handler(req, res, next).catch(next);
export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) return res.status(422).json({ error: { code: "VALIDATION_ERROR", message: "Invalid request", details: error.flatten() } });
  if (error instanceof AppError) return res.status(error.status).json({ error: { code: error.code, message: error.message } });
  const code = typeof error === "object" && error && "code" in error ? (error as { code?: string }).code : undefined;
  if (code === "P2002") return res.status(409).json({ error: { code: "CONFLICT", message: "A record with that value already exists" } });
  console.error("Unhandled request error", error);
  return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } });
}
export const notFound = (_req: Request, res: Response) => res.status(404).json({ error: { code: "NOT_FOUND", message: "Route not found" } });
