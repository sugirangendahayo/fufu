"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerification = sendVerification;
exports.checkVerification = checkVerification;
const env_1 = require("../config/env");
const http_1 = require("./http");
function credentials() {
    if (!env_1.env.TWILIO_ACCOUNT_SID || !env_1.env.TWILIO_AUTH_TOKEN || !env_1.env.TWILIO_VERIFY_SERVICE_SID) {
        throw new http_1.AppError(503, "Phone verification is not configured", "PHONE_VERIFICATION_UNAVAILABLE");
    }
    return { accountSid: env_1.env.TWILIO_ACCOUNT_SID, authToken: env_1.env.TWILIO_AUTH_TOKEN, serviceSid: env_1.env.TWILIO_VERIFY_SERVICE_SID };
}
async function request(path, body) {
    const { accountSid, authToken, serviceSid } = credentials();
    const response = await fetch(`https://verify.twilio.com/v2/Services/${serviceSid}${path}`, {
        method: "POST",
        headers: {
            Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
        const message = typeof payload === "object" && payload && "message" in payload ? String(payload.message) : "The verification provider rejected the request";
        throw new http_1.AppError(502, message, "PHONE_VERIFICATION_DELIVERY_FAILED");
    }
    return payload;
}
async function sendVerification(phone, channel) {
    const result = await request("/Verifications", new URLSearchParams({ To: phone, Channel: channel }));
    if (result.status !== "pending")
        throw new http_1.AppError(502, "The verification code could not be sent", "PHONE_VERIFICATION_DELIVERY_FAILED");
}
async function checkVerification(phone, code) {
    const result = await request("/VerificationCheck", new URLSearchParams({ To: phone, Code: code }));
    return result.status === "approved";
}
//# sourceMappingURL=twilio-verify.js.map