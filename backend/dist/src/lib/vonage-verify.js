"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerification = sendVerification;
exports.checkVerification = checkVerification;
const env_1 = require("../config/env");
const http_1 = require("./http");
function authorization() {
    if (!env_1.env.VONAGE_API_KEY || !env_1.env.VONAGE_API_SECRET) {
        throw new http_1.AppError(503, "Phone verification is not configured", "PHONE_VERIFICATION_UNAVAILABLE");
    }
    return `Basic ${Buffer.from(`${env_1.env.VONAGE_API_KEY}:${env_1.env.VONAGE_API_SECRET}`).toString("base64")}`;
}
async function responseBody(response) {
    const body = await response.json().catch(() => ({}));
    return body && typeof body === "object"
        ? body
        : {};
}
function deliveryError(body) {
    const message = [body.detail, body.title, body.error_text].find((value) => typeof value === "string");
    return new http_1.AppError(502, message ?? "The verification provider rejected the request", "PHONE_VERIFICATION_DELIVERY_FAILED");
}
/** Starts a Vonage Verify v2 request. The returned request id must remain server-side. */
async function sendVerification(phone, channel) {
    const response = await fetch("https://api.nexmo.com/v2/verify", {
        method: "POST",
        headers: {
            Authorization: authorization(),
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            brand: env_1.env.VONAGE_VERIFY_BRAND,
            code_length: 6,
            workflow: [{ channel, to: phone.replace(/^\+/, "") }],
        }),
    });
    const body = await responseBody(response);
    if (!response.ok || typeof body.request_id !== "string") {
        console.warn("Vonage verification request rejected", {
            channel,
            phoneSuffix: phone.slice(-4),
            status: response.status,
            providerMessage: typeof body.detail === "string"
                ? body.detail
                : typeof body.title === "string"
                    ? body.title
                    : undefined,
        });
        throw deliveryError(body);
    }
    console.info("Vonage verification request accepted", {
        requestId: body.request_id,
        channel,
        phoneSuffix: phone.slice(-4),
    });
    return body.request_id;
}
async function checkVerification(requestId, code) {
    const response = await fetch(`https://api.nexmo.com/v2/verify/${encodeURIComponent(requestId)}`, {
        method: "POST",
        headers: {
            Authorization: authorization(),
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
    });
    const body = await responseBody(response);
    if (response.ok) {
        const approved = body.status === "completed";
        console.info("Vonage verification code checked", { requestId, approved });
        return approved;
    }
    if (response.status >= 400 && response.status < 500) {
        console.info("Vonage verification code rejected", {
            requestId,
            status: response.status,
        });
        return false;
    }
    throw deliveryError(body);
}
//# sourceMappingURL=vonage-verify.js.map