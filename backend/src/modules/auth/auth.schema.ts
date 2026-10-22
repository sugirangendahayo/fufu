import { z } from "zod";

export const credentialsSchema = z.object({
  phone: z.string().min(1),
  password: z.string().min(8).max(128),
});
export const registerSchema = credentialsSchema.extend({
  firstName: z.string().min(1).max(80),
  lastName: z.string().max(80).optional(),
  channel: z.enum(["sms", "whatsapp"]).default("sms"),
});
export const requestPhoneVerificationSchema = z.object({
  phone: z.string().min(1),
  channel: z.enum(["sms", "whatsapp"]).default("sms"),
});
export const verifyPhoneSchema = z.object({
  phone: z.string().min(1),
  code: z.string().trim().regex(/^\d{4,10}$/, "Enter the verification code you received"),
});
export const refreshSchema = z.object({ refreshToken: z.string().min(1) });
export const profileSchema = z.object({
  firstName: z.string().min(1).max(80).optional(),
  lastName: z.string().max(80).nullable().optional(),
});
export const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8).max(128),
});

// Pre-inferred TypeScript types for use in service functions
export type RegisterInput = z.infer<typeof registerSchema>;
export type CredentialsInput = z.infer<typeof credentialsSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type PhoneVerificationRequest = z.infer<typeof requestPhoneVerificationSchema>;
export type VerifyPhoneInput = z.infer<typeof verifyPhoneSchema>;
