"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.profileSchema = exports.refreshSchema = exports.verifyPhoneSchema = exports.requestPhoneVerificationSchema = exports.registerSchema = exports.credentialsSchema = void 0;
const zod_1 = require("zod");
exports.credentialsSchema = zod_1.z.object({
    phone: zod_1.z.string().min(1),
    password: zod_1.z.string().min(8).max(128),
});
exports.registerSchema = exports.credentialsSchema.extend({
    firstName: zod_1.z.string().min(1).max(80),
    lastName: zod_1.z.string().max(80).optional(),
    channel: zod_1.z.enum(["sms", "whatsapp"]).default("sms"),
});
exports.requestPhoneVerificationSchema = zod_1.z.object({
    phone: zod_1.z.string().min(1),
    channel: zod_1.z.enum(["sms", "whatsapp"]).default("sms"),
});
exports.verifyPhoneSchema = zod_1.z.object({
    phone: zod_1.z.string().min(1),
    code: zod_1.z.string().trim().regex(/^\d{4,10}$/, "Enter the verification code you received"),
});
exports.refreshSchema = zod_1.z.object({ refreshToken: zod_1.z.string().min(1) });
exports.profileSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1).max(80).optional(),
    lastName: zod_1.z.string().max(80).nullable().optional(),
});
exports.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string(),
    newPassword: zod_1.z.string().min(8).max(128),
});
//# sourceMappingURL=auth.schema.js.map