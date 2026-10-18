"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allow = void 0;
exports.authenticate = authenticate;
const http_1 = require("../lib/http");
const security_1 = require("../lib/security");
function authenticate(req, _res, next) { const token = req.header("authorization")?.replace(/^Bearer\s+/i, ""); const claims = token && (0, security_1.verifyAccessToken)(token); if (!claims || claims.type !== "access")
    return next(new http_1.AppError(401, "Authentication required", "UNAUTHENTICATED")); req.auth = { userId: claims.sub, role: claims.role }; next(); }
const allow = (...roles) => (req, _res, next) => !req.auth || !roles.includes(req.auth.role) ? next(new http_1.AppError(403, "Insufficient permissions", "FORBIDDEN")) : next();
exports.allow = allow;
//# sourceMappingURL=auth.js.map