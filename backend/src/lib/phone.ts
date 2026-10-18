import { AppError } from "./http";

export function normalizeRwandaPhone(phone: string): string {
  const value = phone.replace(/[\s()-]/g, "");
  const normalized = value.startsWith("0")
    ? `+250${value.slice(1)}`
    : value.startsWith("250")
      ? `+${value}`
      : value;
  if (!/^\+2507\d{8}$/.test(normalized)) {
    throw new AppError(422, "Use a valid Rwanda mobile number", "INVALID_PHONE");
  }
  return normalized;
}
