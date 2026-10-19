const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";

type ApiErrorBody = { error?: { code?: string; message?: string } };

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, body: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      "Could not reach Fufu. Check EXPO_PUBLIC_API_URL and that the backend is running.",
      "NETWORK_ERROR",
    );
  }
  const payload = (await response.json().catch(() => ({}))) as T & ApiErrorBody;
  if (!response.ok) {
    throw new ApiError(
      payload.error?.message ?? "Something went wrong. Please try again.",
      payload.error?.code,
    );
  }
  return payload;
}

export type AuthUser = {
  id: string;
  phone: string;
  firstName: string;
  lastName?: string;
  role: "CUSTOMER" | "KITCHEN_STAFF" | "RIDER" | "ADMIN";
  isActive: boolean;
};

type Tokens = { accessToken: string; refreshToken: string; expiresIn: number };

export const authApi = {
  register: (input: {
    phone: string;
    password: string;
    firstName: string;
    lastName?: string;
    channel: "sms" | "whatsapp";
  }) => request<{ data: { user: AuthUser; verificationRequired: boolean } }>("/auth/register", input),
  login: (input: { phone: string; password: string }) =>
    request<{ data: { user: AuthUser } & Tokens }>("/auth/login", input),
  verifyPhone: (input: { phone: string; code: string }) =>
    request<{ data: { user: AuthUser } & Tokens }>("/auth/verify-phone", input),
  resendCode: (input: { phone: string; channel: "sms" | "whatsapp" }) =>
    request<{ data: { verificationRequired: boolean } }>("/auth/phone-verifications", input),
};
