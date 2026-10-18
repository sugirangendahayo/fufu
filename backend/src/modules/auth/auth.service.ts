import type { UserRole } from "../../../generated/prisma/client";
import { prisma } from "../../config/database";
import { env } from "../../config/env";
import { AppError } from "../../lib/http";
import { normalizeRwandaPhone } from "../../lib/phone";
import { createAccessToken, createRefreshToken, hashPassword, hashToken, verifyPassword, verifyRefreshToken } from "../../lib/security";
import type { ChangePasswordInput, CredentialsInput, ProfileInput, RegisterInput } from "./auth.schema";

const publicUser = { id: true, phone: true, firstName: true, lastName: true, role: true, isActive: true, createdAt: true } as const;
type Meta = { ip?: string; userAgent?: string };

export async function issueTokens(user: { id: string; role: UserRole }, meta: Meta) {
  const session = await prisma.session.create({
    data: { userId: user.id, refreshTokenHash: "pending", expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 86400000), ipAddress: meta.ip, userAgent: meta.userAgent },
  });
  const refreshToken = createRefreshToken(user, session.id);
  await prisma.session.update({ where: { id: session.id }, data: { refreshTokenHash: hashToken(refreshToken) } });
  return { accessToken: createAccessToken(user), refreshToken, expiresIn: env.ACCESS_TOKEN_TTL_SECONDS };
}

export async function register(input: RegisterInput, meta: Meta) {
  const user = await prisma.user.create({ data: { phone: normalizeRwandaPhone(input.phone), firstName: input.firstName.trim(), lastName: input.lastName?.trim(), passwordHash: await hashPassword(input.password) }, select: publicUser });
  return { user, ...(await issueTokens(user, meta)) };
}
export async function login(input: CredentialsInput, meta: Meta) {
  const user = await prisma.user.findUnique({ where: { phone: normalizeRwandaPhone(input.phone) } });
  if (!user || !user.isActive || !(await verifyPassword(input.password, user.passwordHash))) throw new AppError(401, "Invalid phone number or password", "INVALID_CREDENTIALS");
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return { user: safeUser, ...(await issueTokens(user, meta)) };
}
export async function refresh(token: string, meta: Meta) {
  const claims = verifyRefreshToken(token);
  if (!claims || claims.type !== "refresh" || !claims.sid) throw new AppError(401, "Invalid refresh token", "INVALID_REFRESH_TOKEN");
  const session = await prisma.session.findUnique({ where: { id: claims.sid }, include: { user: true } });
  if (!session || session.revokedAt || session.expiresAt <= new Date() || session.refreshTokenHash !== hashToken(token) || !session.user.isActive) throw new AppError(401, "Refresh token has expired or was revoked", "INVALID_REFRESH_TOKEN");
  await prisma.session.update({ where: { id: session.id }, data: { revokedAt: new Date() } });
  return issueTokens(session.user, meta);
}
export async function logout(token: string) {
  const claims = verifyRefreshToken(token);
  if (claims?.sid) await prisma.session.updateMany({ where: { id: claims.sid, refreshTokenHash: hashToken(token), revokedAt: null }, data: { revokedAt: new Date() } });
}
export async function me(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: publicUser });
  if (!user) throw new AppError(401, "User not found", "UNAUTHENTICATED");
  return user;
}
export const updateProfile = (userId: string, input: ProfileInput) => prisma.user.update({ where: { id: userId }, data: input, select: publicUser });
export async function changePassword(userId: string, input: ChangePasswordInput) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (!(await verifyPassword(input.currentPassword, user.passwordHash))) throw new AppError(401, "Current password is incorrect", "INVALID_CREDENTIALS");
  const passwordHash = await hashPassword(input.newPassword);
  await prisma.$transaction([prisma.user.update({ where: { id: user.id }, data: { passwordHash } }), prisma.session.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } })]);
}
