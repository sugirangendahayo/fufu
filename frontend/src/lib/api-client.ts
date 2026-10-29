import { authApi } from "@/features/auth/api";
import { useAuthStore } from "@/features/auth/auth-store";

const API_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000/api/v1"
).replace(/\/$/, "");

type ApiErrorPayload = {
  error?: {
    code?: string;
    message?: string;
  };
};

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

type RequestOptions = {
  body?: unknown;
  method?: "DELETE" | "GET" | "PATCH" | "POST";
  signal?: AbortSignal;
  skipAuthRefresh?: boolean;
  token?: string | null;
};

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken() {
  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) return null;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const { data } = await authApi.refresh(refreshToken);
        const current = useAuthStore.getState();
        const user = current.user ?? (await authApi.me(data.accessToken)).data;

        await current.setSession({
          user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });
        return data.accessToken;
      } catch {
        await useAuthStore.getState().clearSession();
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

export async function apiRequest<T>(
  path: string,
  {
    body,
    method = "GET",
    signal,
    skipAuthRefresh = false,
    token,
  }: RequestOptions = {},
): Promise<T> {
  const send = (requestToken: string | null | undefined) =>
    fetch(`${API_URL}${path}`, {
      body: body === undefined ? undefined : JSON.stringify(body),
      headers: {
        Accept: "application/json",
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        ...(requestToken ? { Authorization: `Bearer ${requestToken}` } : {}),
      },
      method,
      signal,
    });

  let response: Response;

  try {
    response = await send(token);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "name" in error &&
      error.name === "AbortError"
    ) {
      throw error;
    }

    throw new ApiClientError(
      "Could not reach Fufu. Check your connection and try again.",
      "NETWORK_ERROR",
    );
  }

  if (response.status === 401 && token && !skipAuthRefresh) {
    const refreshedToken = await refreshAccessToken();
    if (refreshedToken) {
      try {
        response = await send(refreshedToken);
      } catch (error) {
        if (
          typeof error === "object" &&
          error !== null &&
          "name" in error &&
          error.name === "AbortError"
        ) {
          throw error;
        }

        throw new ApiClientError(
          "Could not reach Fufu. Check your connection and try again.",
          "NETWORK_ERROR",
        );
      }
    }
  }

  const payload = (await response.json().catch(() => undefined)) as
    | (T & ApiErrorPayload)
    | undefined;

  if (!response.ok) {
    throw new ApiClientError(
      payload?.error?.message ?? "Something went wrong. Please try again.",
      payload?.error?.code,
      response.status,
    );
  }

  return payload as T;
}
