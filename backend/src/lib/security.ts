import crypto from "node:crypto";
import { env } from "../config/env";

const b64 = (value: string | Buffer) => Buffer.from(value).toString("base64url");
const hash = (value: string) => crypto.createHash("sha256").update(value).digest("hex");
export const hashToken = hash;
export function hashPassword(password: string) { const salt = crypto.randomBytes(16).toString("hex"); return new Promise<string>((resolve, reject) => crypto.scrypt(password, salt, 64, (err, key) => err ? reject(err) : resolve(`scrypt$${salt}$${key.toString("hex")}`))); }
export async function verifyPassword(password: string, stored: string) { const [, salt, expected] = stored.split("$"); if (!salt || !expected) return false; const actual = await hashPasswordWithSalt(password, salt); return crypto.timingSafeEqual(Buffer.from(actual, "hex"), Buffer.from(expected, "hex")); }
function hashPasswordWithSalt(password: string, salt: string) { return new Promise<string>((resolve, reject) => crypto.scrypt(password, salt, 64, (err, key) => err ? reject(err) : resolve(key.toString("hex")))); }
type Claims = { sub: string; role: string; exp: number; type: "access" | "refresh"; sid?: string };
function sign(claims: Claims, secret: string) { const body = b64(JSON.stringify(claims)); const signature = crypto.createHmac("sha256", secret).update(body).digest("base64url"); return `${body}.${signature}`; }
function verify(token: string, secret: string): Claims | null { const [body, signature] = token.split("."); if (!body || !signature) return null; const expected = crypto.createHmac("sha256", secret).update(body).digest("base64url"); if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null; try { const claims = JSON.parse(Buffer.from(body, "base64url").toString()) as Claims; return claims.exp > Math.floor(Date.now() / 1000) ? claims : null; } catch { return null; } }
export function createAccessToken(user: { id: string; role: string }) { return sign({ sub: user.id, role: user.role, type: "access", exp: Math.floor(Date.now() / 1000) + env.ACCESS_TOKEN_TTL_SECONDS }, env.ACCESS_TOKEN_SECRET); }
export function createRefreshToken(user: { id: string; role: string }, sessionId: string) { return sign({ sub: user.id, role: user.role, sid: sessionId, type: "refresh", exp: Math.floor(Date.now() / 1000) + env.REFRESH_TOKEN_TTL_DAYS * 86400 }, env.REFRESH_TOKEN_SECRET); }
export const verifyAccessToken = (token: string) => verify(token, env.ACCESS_TOKEN_SECRET);
export const verifyRefreshToken = (token: string) => verify(token, env.REFRESH_TOKEN_SECRET);
export const randomRef = () => crypto.randomBytes(18).toString("base64url");
