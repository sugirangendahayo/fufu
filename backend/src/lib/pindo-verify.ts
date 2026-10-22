import { env } from "../config/env";
import { AppError } from "./http";
import { logger } from "./logger";

// Pindo Verify API base URL
const PINDO_BASE = "https://api.pindo.io/v1/sms/verify";

/**
 * Note: Pindo Verify is SMS-only. The `channel` parameter is accepted for
 * API-contract compatibility with the existing registration/resend-code
 * endpoints but is not forwarded to Pindo (it only supports SMS).
 */
export type VerificationChannel = "sms" | "whatsapp";

function authHeader(): string {
  if (!env.PINDO_API_TOKEN) {
    throw new AppError(
      503,
      "Phone verification is not configured",
      "PHONE_VERIFICATION_UNAVAILABLE",
    );
  }
  return `Bearer ${env.PINDO_API_TOKEN}`;
}

async function responseBody(
  response: Response,
): Promise<Record<string, unknown>> {
  const body: unknown = await response.json().catch(() => ({}));
  return body && typeof body === "object"
    ? (body as Record<string, unknown>)
    : {};
}

function deliveryError(body: Record<string, unknown>) {
  const message = [body.message, body.detail, body.error].find(
    (v): v is string => typeof v === "string" && v !== "success",
  );
  return new AppError(
    502,
    message ?? "The verification provider rejected the request",
    "PHONE_VERIFICATION_DELIVERY_FAILED",
  );
}

/**
 * Cancels an in-progress Pindo Verify request.
 *
 * Must be called with the existing providerRequestId before issuing a new
 * verification for the same number — Pindo returns 409 if a prior request is
 * still active. Failures are logged but never thrown.
 */
export async function cancelVerification(requestId: string): Promise<void> {
  logger.info("pindo.cancelVerification: cancelling request", { requestId });
  try {
    const response = await fetch(
      `${PINDO_BASE}/cancel/${encodeURIComponent(requestId)}`,
      {
        method: "PUT",
        headers: { Authorization: authHeader() },
      },
    );
    if (response.ok) {
      logger.info("pindo.cancelVerification: cancelled", { requestId });
    } else {
      const body = await responseBody(response);
      // 404 = already expired/consumed — safe to ignore
      logger.warn("pindo.cancelVerification: non-ok response (ignored)", {
        requestId,
        status: response.status,
        providerMessage:
          typeof body.message === "string" ? body.message : undefined,
      });
    }
  } catch (err) {
    logger.warn("pindo.cancelVerification: network error (ignored)", {
      requestId,
      error: String(err),
    });
  }
}

/**
 * Makes a single POST /v1/sms/verify call.
 * Separated from the retry logic so it can be called twice cleanly.
 */
async function doSendRequest(
  phone: string,
): Promise<{ response: Response; body: Record<string, unknown> }> {
  const response = await fetch(PINDO_BASE, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      brand: env.PINDO_VERIFY_BRAND,
      number: phone, // already +250xxxxxxxxx from normalizeRwandaPhone
    }),
  });
  const body = await responseBody(response);
  return { response, body };
}

/**
 * Sends a PIN to the given phone number via Pindo Verify.
 *
 * Handles 409 (active request already exists at Pindo) automatically:
 *   - If Pindo returns the conflicting request_id in the 409 body, we cancel
 *     it and retry once.
 *   - If Pindo doesn't include a request_id, we still retry once after a short
 *     delay (the conflicting request may have just expired).
 *
 * The returned request_id is stored server-side in PhoneVerification.providerRequestId.
 * It is NEVER sent to the client.
 */
export async function sendVerification(
  phone: string,
  _channel: VerificationChannel,
): Promise<string> {
  logger.info("pindo.sendVerification: requesting PIN", {
    phoneSuffix: phone.slice(-4),
  });

  const { response, body } = await doSendRequest(phone);

  // ── Happy path ────────────────────────────────────────────────────────────
  if (response.ok && typeof body.request_id === "string") {
    logger.info("pindo.sendVerification: PIN sent", {
      requestId: body.request_id,
      phoneSuffix: phone.slice(-4),
    });
    return body.request_id;
  }

  // ── 409: Pindo uses this for both "active request exists" AND billing errors ──
  if (response.status === 409) {
    // Log the full body — always useful for diagnosis.
    logger.warn("pindo.sendVerification: 409 from Pindo", {
      phoneSuffix: phone.slice(-4),
      fullBody: body,
    });

    // Detect insufficient balance (Pindo returns 409 for this — not 402).
    const isWalletError =
      typeof body.error === "string" &&
      body.error.toLowerCase().includes("insufficient");
    if (isWalletError) {
      logger.error(
        "pindo.sendVerification: Pindo wallet has insufficient balance — top up at app.pindo.io",
        { phoneSuffix: phone.slice(-4) },
      );
      throw new AppError(
        503,
        "SMS verification is temporarily unavailable. Please try again later.",
        "PHONE_VERIFICATION_UNAVAILABLE",
      );
    }

    // True conflict: prior active request still open.
    // Cancel it if Pindo gave us the request_id, then retry once.
    const conflictingId =
      typeof body.request_id === "string" ? body.request_id : null;

    if (conflictingId) {
      logger.info(
        "pindo.sendVerification: cancelling conflicting request before retry",
        { conflictingId, phoneSuffix: phone.slice(-4) },
      );
      await cancelVerification(conflictingId);
    } else {
      logger.info(
        "pindo.sendVerification: no request_id in 409 body; waiting 2 s before retry",
        { phoneSuffix: phone.slice(-4) },
      );
      await new Promise((r) => setTimeout(r, 2000));
    }

    logger.info("pindo.sendVerification: retrying after 409 resolution", {
      phoneSuffix: phone.slice(-4),
    });
    const { response: r2, body: b2 } = await doSendRequest(phone);

    if (r2.ok && typeof b2.request_id === "string") {
      logger.info("pindo.sendVerification: PIN sent (after 409 recovery)", {
        requestId: b2.request_id,
        phoneSuffix: phone.slice(-4),
      });
      return b2.request_id;
    }

    logger.error("pindo.sendVerification: retry failed after 409 recovery", {
      status: r2.status,
      phoneSuffix: phone.slice(-4),
      fullBody: b2,
    });
    throw deliveryError(b2);
  }

  // ── Any other non-ok response ─────────────────────────────────────────────
  logger.warn("pindo.sendVerification: request rejected", {
    status: response.status,
    phoneSuffix: phone.slice(-4),
    providerMessage:
      typeof body.message === "string" ? body.message : undefined,
  });
  throw deliveryError(body);
}

/**
 * Checks a PIN against the Pindo Verify API.
 * Returns true only when Pindo confirms success. Any non-2xx response
 * (wrong code, expired, already used) returns false without throwing.
 * Network/server errors throw so the caller can surface a 502.
 */
export async function checkVerification(
  requestId: string,
  code: string,
): Promise<boolean> {
  logger.info("pindo.checkVerification: checking PIN", { requestId });

  const response = await fetch(`${PINDO_BASE}/check`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code, request_id: requestId }),
  });

  const body = await responseBody(response);

  if (response.ok && body.message === "success") {
    logger.info("pindo.checkVerification: PIN approved", { requestId });
    return true;
  }

  // 4xx → wrong code / expired / already consumed → invalid, do not throw
  if (response.status >= 400 && response.status < 500) {
    logger.warn("pindo.checkVerification: PIN rejected", {
      requestId,
      status: response.status,
      providerMessage:
        typeof body.message === "string" ? body.message : undefined,
    });
    return false;
  }

  // 5xx or unexpected → upstream failure
  logger.error("pindo.checkVerification: provider error", {
    requestId,
    status: response.status,
    fullBody: body,
  });
  throw deliveryError(body);
}
