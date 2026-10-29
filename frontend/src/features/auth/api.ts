const API_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000/api/v1"
).replace(/\/$/, "");

type ApiErrorBody = { error?: { code?: string; message?: string } };
type RequestOptions = {
  method?: "GET" | "POST" | "PATCH";
  token?: string | null;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  body?: unknown,
  { method = "POST", token }: RequestOptions = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      body: body === undefined ? undefined : JSON.stringify(body),
      headers: {
        Accept: "application/json",
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      method,
    });
  } catch {
    throw new ApiError(
      "Could not reach Fufu. Check EXPO_PUBLIC_API_URL and that the backend is running.",
      "NETWORK_ERROR",
    );
  }
  const payload = (await response.json().catch(() => undefined)) as
    | (T & ApiErrorBody)
    | undefined;
  if (!response.ok) {
    throw new ApiError(
      payload?.error?.message ?? "Something went wrong. Please try again.",
      payload?.error?.code,
    );
  }
  return payload as T;
}

export type AuthUser = {
  id: string;
  phone: string;
  firstName: string;
  lastName?: string;
  role: "CUSTOMER" | "KITCHEN_STAFF" | "RIDER" | "ADMIN";
  isActive: boolean;
  createdAt?: string;
};

type Tokens = { accessToken: string; refreshToken: string; expiresIn: number };

export const authApi = {
  register: (input: {
    phone: string;
    password: string;
    firstName: string;
    lastName?: string;
    channel: "sms"; // Pindo Verify is SMS-only
  }) =>
    request<{ data: { user: AuthUser; verificationRequired: boolean } }>(
      "/auth/register",
      input,
    ),
  login: (input: { phone: string; password: string }) =>
    request<{ data: { user: AuthUser } & Tokens }>("/auth/login", input),
  verifyPhone: (input: { phone: string; code: string }) =>
    request<{ data: { user: AuthUser } & Tokens }>("/auth/verify-phone", input),
  refresh: (refreshToken: string) =>
    request<{ data: Tokens }>("/auth/refresh", { refreshToken }),
  me: (accessToken: string) =>
    request<{ data: AuthUser }>("/auth/me", undefined, {
      method: "GET",
      token: accessToken,
    }),
  resendCode: (input: { phone: string; channel: "sms" }) => // Pindo Verify is SMS-only
    request<{ data: { verificationRequired: boolean } }>(
      "/auth/phone-verifications",
      input,
    ),
  logout: (refreshToken: string) =>
    request<void>("/auth/logout", { refreshToken }),
};
