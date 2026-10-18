"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomRef = exports.verifyRefreshToken = exports.verifyAccessToken = exports.hashToken = void 0;
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
exports.createAccessToken = createAccessToken;
exports.createRefreshToken = createRefreshToken;
const node_crypto_1 = __importDefault(require("node:crypto"));
const env_1 = require("../config/env");
const b64 = (value) => Buffer.from(value).toString("base64url");
const hash = (value) => node_crypto_1.default.createHash("sha256").update(value).digest("hex");
exports.hashToken = hash;
function hashPassword(password) { const salt = node_crypto_1.default.randomBytes(16).toString("hex"); return new Promise((resolve, reject) => node_crypto_1.default.scrypt(password, salt, 64, (err, key) => err ? reject(err) : resolve(`scrypt$${salt}$${key.toString("hex")}`))); }
async function verifyPassword(password, stored) { const [, salt, expected] = stored.split("$"); if (!salt || !expected)
    return false; const actual = await hashPasswordWithSalt(password, salt); return node_crypto_1.default.timingSafeEqual(Buffer.from(actual, "hex"), Buffer.from(expected, "hex")); }
function hashPasswordWithSalt(password, salt) { return new Promise((resolve, reject) => node_crypto_1.default.scrypt(password, salt, 64, (err, key) => err ? reject(err) : resolve(key.toString("hex")))); }
function sign(claims, secret) { const body = b64(JSON.stringify(claims)); const signature = node_crypto_1.default.createHmac("sha256", secret).update(body).digest("base64url"); return `${body}.${signature}`; }
function verify(token, secret) { const [body, signature] = token.split("."); if (!body || !signature)
    return null; const expected = node_crypto_1.default.createHmac("sha256", secret).update(body).digest("base64url"); if (signature.length !== expected.length || !node_crypto_1.default.timingSafeEqual(Buffer.from(signature), Buffer.from(expected)))
    return null; try {
    const claims = JSON.parse(Buffer.from(body, "base64url").toString());
    return claims.exp > Math.floor(Date.now() / 1000) ? claims : null;
}
catch {
    return null;
} }
function createAccessToken(user) { return sign({ sub: user.id, role: user.role, type: "access", exp: Math.floor(Date.now() / 1000) + env_1.env.ACCESS_TOKEN_TTL_SECONDS }, env_1.env.ACCESS_TOKEN_SECRET); }
function createRefreshToken(user, sessionId) { return sign({ sub: user.id, role: user.role, sid: sessionId, type: "refresh", exp: Math.floor(Date.now() / 1000) + env_1.env.REFRESH_TOKEN_TTL_DAYS * 86400 }, env_1.env.REFRESH_TOKEN_SECRET); }
const verifyAccessToken = (token) => verify(token, env_1.env.ACCESS_TOKEN_SECRET);
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => verify(token, env_1.env.REFRESH_TOKEN_SECRET);
exports.verifyRefreshToken = verifyRefreshToken;
const randomRef = () => node_crypto_1.default.randomBytes(18).toString("base64url");
exports.randomRef = randomRef;
//# sourceMappingURL=security.js.map