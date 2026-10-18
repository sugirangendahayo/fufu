/** Roles supplied by backend authentication once it is available. */
export type UserRole = "customer" | "kitchen_staff" | "delivery_rider" | "admin";

/**
 * Development-only default while authentication is unavailable.
 * This must be replaced with a backend-validated session role; route selection
 * in the client is not an authorization boundary.
 */
export const DEVELOPMENT_DEFAULT_ROLE: UserRole = "customer";
