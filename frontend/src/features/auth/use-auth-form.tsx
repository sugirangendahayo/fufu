import { useCallback, useRef, useState } from "react";
import type { ApiError } from "@/features/auth/api";

export type Message = { id: number; tone: "error" | "info"; text: string };

/**
 * The submit lifecycle for an auth form, in one place so no screen can get it
 * wrong.
 *
 * FIX 3: `inFlight` is a ref, set at the moment of the tap. A `disabled` prop
 * only updates after the next render. And a task that returns "leaving" (it
 * dispatched navigation) keeps the form busy until the route swap removes the
 * screen; resetting after a successful `router.replace` re-armed the button
 * mid-transition, so a second tap fired a second request (on signup, a second
 * SMS).
 *
 * FIX 11: every message gets a fresh id. Use it as the React `key` of the
 * message component, so showing the same text twice still re-mounts it and the
 * tap gets visible feedback.
 */
export function useAuthForm() {
  const [message, setMessage] = useState<Message>();
  const [submitting, setSubmitting] = useState(false);
  const inFlight = useRef(false);
  const nextId = useRef(0);

  const show = useCallback((tone: Message["tone"], text: string) => {
    setMessage({ id: ++nextId.current, tone, text });
  }, []);
  const clear = useCallback(() => setMessage(undefined), []);

  /**
   * Runs `task` once at a time. Return "leaving" from it right after
   * dispatching navigation; return nothing on any failure path.
   */
  const submit = useCallback(async (task: () => Promise<"leaving" | void>) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setSubmitting(true);
    let leaving = false;
    try {
      leaving = (await task()) === "leaving";
    } finally {
      if (!leaving) {
        inFlight.current = false;
        setSubmitting(false);
      }
    }
  }, []);

  return { message, show, clear, submitting, submit };
}

// FIX 5: `as` is a cast, not a check. Anything thrown might not have a
// `.message`; falling through to `setError(undefined)` would clear the error
// and make the tap look like it did nothing.
export const asApiError = (reason: unknown) =>
  reason as Partial<ApiError> | undefined;

export const errorText = (reason: unknown, fallback: string) =>
  asApiError(reason)?.message || fallback;