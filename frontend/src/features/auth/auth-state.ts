import type { UserRole } from "./role";

/**
 * Contract for a future backend-backed authentication provider.
 * No authentication or role validation is implemented in the frontend yet.
 */
export type AuthState =
  | { status: "loading" }
  | { status: "unauthenticated" }
  | { status: "authenticated"; role: UserRole };
