import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "../../generated/prisma/client";
import { AppError } from "../lib/http";
import { verifyAccessToken } from "../lib/security";

declare global { namespace Express { interface Request { auth?: { userId: string; role: UserRole }; } } }
export function authenticate(req: Request, _res: Response, next: NextFunction) { const token = req.header("authorization")?.replace(/^Bearer\s+/i, ""); const claims = token && verifyAccessToken(token); if (!claims || claims.type !== "access") return next(new AppError(401, "Authentication required", "UNAUTHENTICATED")); req.auth = { userId: claims.sub, role: claims.role as UserRole }; next(); }
export const allow = (...roles: UserRole[]) => (req: Request, _res: Response, next: NextFunction) => !req.auth || !roles.includes(req.auth.role) ? next(new AppError(403, "Insufficient permissions", "FORBIDDEN")) : next();
