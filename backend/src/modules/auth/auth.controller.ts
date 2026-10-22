import type { Request, Response } from "express";
import { asyncHandler } from "../../lib/http";
import * as service from "./auth.service";
import { changePasswordSchema, credentialsSchema, profileSchema, refreshSchema, registerSchema, requestPhoneVerificationSchema, verifyPhoneSchema } from "./auth.schema";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.register(registerSchema.parse(req.body), { ip: req.ip, userAgent: req.header("user-agent") });
  res.status(201).json({ data: result });
});
export const requestPhoneVerification = asyncHandler(async (req: Request, res: Response) => {
  res.status(202).json({ data: await service.requestPhoneVerification(requestPhoneVerificationSchema.parse(req.body)) });
});
export const verifyPhone = asyncHandler(async (req: Request, res: Response) => {
  res.json({ data: await service.verifyPhone(verifyPhoneSchema.parse(req.body), { ip: req.ip, userAgent: req.header("user-agent") }) });
});
export const login = asyncHandler(async (req: Request, res: Response) => {
  res.json({ data: await service.login(credentialsSchema.parse(req.body), { ip: req.ip, userAgent: req.header("user-agent") }) });
});
export const refresh = asyncHandler(async (req: Request, res: Response) => {
  res.json({ data: await service.refresh(refreshSchema.parse(req.body).refreshToken, { ip: req.ip, userAgent: req.header("user-agent") }) });
});
export const logout = asyncHandler(async (req: Request, res: Response) => {
  await service.logout(refreshSchema.parse(req.body).refreshToken); res.status(204).end();
});
export const me = asyncHandler(async (req: Request, res: Response) => res.json({ data: await service.me(req.auth!.userId) }));
export const updateProfile = asyncHandler(async (req: Request, res: Response) => res.json({ data: await service.updateProfile(req.auth!.userId, profileSchema.parse(req.body)) }));
export const changePassword = asyncHandler(async (req: Request, res: Response) => { await service.changePassword(req.auth!.userId, changePasswordSchema.parse(req.body)); res.status(204).end(); });
