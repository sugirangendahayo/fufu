"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = void 0;
exports.issueTokens = issueTokens;
exports.register = register;
exports.requestPhoneVerification = requestPhoneVerification;
exports.verifyPhone = verifyPhone;
exports.login = login;
exports.refresh = refresh;
exports.logout = logout;
exports.me = me;
exports.changePassword = changePassword;
const database_1 = require("../../config/database");
const env_1 = require("../../config/env");
const http_1 = require("../../lib/http");
const phone_1 = require("../../lib/phone");
const security_1 = require("../../lib/security");
const vonage_verify_1 = require("../../lib/vonage-verify");
const publicUser = { id: true, phone: true, firstName: true, lastName: true, role: true, isActive: true, createdAt: true };
async function issueTokens(user, meta) {
    const session = await database_1.prisma.session.create({
        data: { userId: user.id, refreshTokenHash: "pending", expiresAt: new Date(Date.now() + env_1.env.REFRESH_TOKEN_TTL_DAYS * 86400000), ipAddress: meta.ip, userAgent: meta.userAgent },
    });
    const refreshToken = (0, security_1.createRefreshToken)(user, session.id);
    await database_1.prisma.session.update({ where: { id: session.id }, data: { refreshTokenHash: (0, security_1.hashToken)(refreshToken) } });
    return { accessToken: (0, security_1.createAccessToken)(user), refreshToken, expiresIn: env_1.env.ACCESS_TOKEN_TTL_SECONDS };
}
async function register(input, meta) {
    const phone = (0, phone_1.normalizeRwandaPhone)(input.phone);
    const existing = await database_1.prisma.user.findUnique({ where: { phone }, select: publicUser });
    if (existing?.isActive)
        throw new http_1.AppError(409, "An account with that phone number already exists", "PHONE_ALREADY_REGISTERED");
    const user = existing ?? await database_1.prisma.user.create({ data: { phone, firstName: input.firstName.trim(), lastName: input.lastName?.trim(), passwordHash: await (0, security_1.hashPassword)(input.password), isActive: false }, select: publicUser });
    await createPhoneVerification(user.id, phone, input.channel);
    return { user, verificationRequired: true, channel: input.channel };
}
async function requestPhoneVerification(input) {
    const phone = (0, phone_1.normalizeRwandaPhone)(input.phone);
    const user = await database_1.prisma.user.findUnique({ where: { phone }, select: { id: true, phoneVerifiedAt: true } });
    if (!user)
        throw new http_1.AppError(404, "No account was found for that phone number", "PHONE_NOT_REGISTERED");
    if (user.phoneVerifiedAt)
        throw new http_1.AppError(409, "This phone number is already verified", "PHONE_ALREADY_VERIFIED");
    await createPhoneVerification(user.id, phone, input.channel);
    return { phone, verificationRequired: true, channel: input.channel };
}
async function verifyPhone(input, meta) {
    const phone = (0, phone_1.normalizeRwandaPhone)(input.phone);
    const user = await database_1.prisma.user.findUnique({ where: { phone } });
    if (!user)
        throw new http_1.AppError(404, "No account was found for that phone number", "PHONE_NOT_REGISTERED");
    const verification = await database_1.prisma.phoneVerification.findFirst({ where: { userId: user.id, consumedAt: null }, orderBy: { createdAt: "desc" } });
    if (!verification)
        throw new http_1.AppError(422, "Request a new verification code", "VERIFICATION_NOT_REQUESTED");
    if (!(await (0, vonage_verify_1.checkVerification)(verification.providerRequestId, input.code)))
        throw new http_1.AppError(422, "The verification code is invalid or has expired", "INVALID_VERIFICATION_CODE");
    const verifiedUser = await database_1.prisma.$transaction(async (tx) => {
        const consumed = await tx.phoneVerification.updateMany({ where: { id: verification.id, consumedAt: null }, data: { consumedAt: new Date() } });
        if (!consumed.count)
            throw new http_1.AppError(409, "This verification code has already been used", "VERIFICATION_ALREADY_USED");
        return tx.user.update({ where: { id: user.id }, data: { isActive: true, phoneVerifiedAt: new Date() }, select: publicUser });
    });
    return { user: verifiedUser, ...(await issueTokens(verifiedUser, meta)) };
}
async function createPhoneVerification(userId, phone, channel) {
    const providerRequestId = await (0, vonage_verify_1.sendVerification)(phone, channel);
    await database_1.prisma.phoneVerification.create({ data: { userId, providerRequestId, channel } });
}
async function login(input, meta) {
    const user = await database_1.prisma.user.findUnique({ where: { phone: (0, phone_1.normalizeRwandaPhone)(input.phone) } });
    if (!user || !user.isActive || !user.phoneVerifiedAt || !(await (0, security_1.verifyPassword)(input.password, user.passwordHash)))
        throw new http_1.AppError(401, "Invalid phone number or password", "INVALID_CREDENTIALS");
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return { user: safeUser, ...(await issueTokens(user, meta)) };
}
async function refresh(token, meta) {
    const claims = (0, security_1.verifyRefreshToken)(token);
    if (!claims || claims.type !== "refresh" || !claims.sid)
        throw new http_1.AppError(401, "Invalid refresh token", "INVALID_REFRESH_TOKEN");
    const session = await database_1.prisma.session.findUnique({ where: { id: claims.sid }, include: { user: true } });
    if (!session || session.revokedAt || session.expiresAt <= new Date() || session.refreshTokenHash !== (0, security_1.hashToken)(token) || !session.user.isActive)
        throw new http_1.AppError(401, "Refresh token has expired or was revoked", "INVALID_REFRESH_TOKEN");
    await database_1.prisma.session.update({ where: { id: session.id }, data: { revokedAt: new Date() } });
    return issueTokens(session.user, meta);
}
async function logout(token) {
    const claims = (0, security_1.verifyRefreshToken)(token);
    if (claims?.sid)
        await database_1.prisma.session.updateMany({ where: { id: claims.sid, refreshTokenHash: (0, security_1.hashToken)(token), revokedAt: null }, data: { revokedAt: new Date() } });
}
async function me(userId) {
    const user = await database_1.prisma.user.findUnique({ where: { id: userId }, select: publicUser });
    if (!user)
        throw new http_1.AppError(401, "User not found", "UNAUTHENTICATED");
    return user;
}
const updateProfile = (userId, input) => database_1.prisma.user.update({ where: { id: userId }, data: input, select: publicUser });
exports.updateProfile = updateProfile;
async function changePassword(userId, input) {
    const user = await database_1.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (!(await (0, security_1.verifyPassword)(input.currentPassword, user.passwordHash)))
        throw new http_1.AppError(401, "Current password is incorrect", "INVALID_CREDENTIALS");
    const passwordHash = await (0, security_1.hashPassword)(input.newPassword);
    await database_1.prisma.$transaction([database_1.prisma.user.update({ where: { id: user.id }, data: { passwordHash } }), database_1.prisma.session.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } })]);
}
//# sourceMappingURL=auth.service.js.map