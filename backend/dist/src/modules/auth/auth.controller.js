"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.updateProfile = exports.me = exports.logout = exports.refresh = exports.login = exports.register = void 0;
const http_1 = require("../../lib/http");
const service = __importStar(require("./auth.service"));
const auth_schema_1 = require("./auth.schema");
exports.register = (0, http_1.asyncHandler)(async (req, res) => {
    const result = await service.register(auth_schema_1.registerSchema.parse(req.body), { ip: req.ip, userAgent: req.header("user-agent") });
    res.status(201).json({ data: result });
});
exports.login = (0, http_1.asyncHandler)(async (req, res) => {
    res.json({ data: await service.login(auth_schema_1.credentialsSchema.parse(req.body), { ip: req.ip, userAgent: req.header("user-agent") }) });
});
exports.refresh = (0, http_1.asyncHandler)(async (req, res) => {
    res.json({ data: await service.refresh(auth_schema_1.refreshSchema.parse(req.body).refreshToken, { ip: req.ip, userAgent: req.header("user-agent") }) });
});
exports.logout = (0, http_1.asyncHandler)(async (req, res) => {
    await service.logout(auth_schema_1.refreshSchema.parse(req.body).refreshToken);
    res.status(204).end();
});
exports.me = (0, http_1.asyncHandler)(async (req, res) => res.json({ data: await service.me(req.auth.userId) }));
exports.updateProfile = (0, http_1.asyncHandler)(async (req, res) => res.json({ data: await service.updateProfile(req.auth.userId, auth_schema_1.profileSchema.parse(req.body)) }));
exports.changePassword = (0, http_1.asyncHandler)(async (req, res) => { await service.changePassword(req.auth.userId, auth_schema_1.changePasswordSchema.parse(req.body)); res.status(204).end(); });
//# sourceMappingURL=auth.controller.js.map