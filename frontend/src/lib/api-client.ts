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
  token?: string | null;
};

export async function apiRequest<T>(
  path: string,
  { body, method = "GET", signal, token }: RequestOptions = {},
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
      signal,
    });
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
