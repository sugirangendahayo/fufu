"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeRwandaPhone = normalizeRwandaPhone;
const http_1 = require("./http");
function normalizeRwandaPhone(phone) {
    const value = phone.replace(/[\s()-]/g, "");
    const normalized = value.startsWith("0")
        ? `+250${value.slice(1)}`
        : value.startsWith("250")
            ? `+${value}`
            : value;
    if (!/^\+2507\d{8}$/.test(normalized)) {
        throw new http_1.AppError(422, "Use a valid Rwanda mobile number", "INVALID_PHONE");
    }
    return normalized;
}
//# sourceMappingURL=phone.js.map