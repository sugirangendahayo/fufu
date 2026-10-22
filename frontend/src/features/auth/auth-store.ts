/**
 * Persistent authentication store.
 *
 * Tokens are written to expo-secure-store so the session survives app
 * restarts.  The root layout calls `hydrate()` once on mount; screens call
 * `setSession` after login and `clearSession` on logout.
 */
import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import type { AuthUser } from "./api";

// ─── storage keys ────────────────────────────────────────────────────────────
const KEY_ACCESS  = "fufu.accessToken";
const KEY_REFRESH = "fufu.refreshToken";
const KEY_USER    = "fufu.user";

// ─── state shape ─────────────────────────────────────────────────────────────
export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthStore {
  status:       AuthStatus;
  user:         AuthUser | null;
  accessToken:  string | null;
  refreshToken: string | null;

  /** Called once by the root layout to restore a persisted session. */
  hydrate: () => Promise<void>;

  /** Persist tokens + user after a successful login or verify-phone call. */
  setSession: (params: {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
  }) => Promise<void>;

  /** Wipe everything — called on logout or token expiry. */
  clearSession: () => Promise<void>;
}

// ─── store ───────────────────────────────────────────────────────────────────
export const useAuthStore = create<AuthStore>((set) => ({
  status:       "loading",
  user:         null,
  accessToken:  null,
  refreshToken: null,

  hydrate: async () => {
    try {
      const [access, refresh, userJson] = await Promise.all([
        SecureStore.getItemAsync(KEY_ACCESS),
        SecureStore.getItemAsync(KEY_REFRESH),
        SecureStore.getItemAsync(KEY_USER),
      ]);

      if (access && refresh && userJson) {
        const user = JSON.parse(userJson) as AuthUser;
        set({ status: "authenticated", user, accessToken: access, refreshToken: refresh });
      } else {
        set({ status: "unauthenticated" });
      }
    } catch {
      // Corrupt store — treat as logged out.
      set({ status: "unauthenticated" });
    }
  },

  setSession: async ({ user, accessToken, refreshToken }) => {
    await Promise.all([
      SecureStore.setItemAsync(KEY_ACCESS,  accessToken),
      SecureStore.setItemAsync(KEY_REFRESH, refreshToken),
      SecureStore.setItemAsync(KEY_USER,    JSON.stringify(user)),
    ]);
    set({ status: "authenticated", user, accessToken, refreshToken });
  },

  clearSession: async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(KEY_ACCESS),
      SecureStore.deleteItemAsync(KEY_REFRESH),
      SecureStore.deleteItemAsync(KEY_USER),
    ]);
    set({ status: "unauthenticated", user: null, accessToken: null, refreshToken: null });
  },
}));
