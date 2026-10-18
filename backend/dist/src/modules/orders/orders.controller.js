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
exports.cancel = exports.get = exports.list = exports.checkout = void 0;
const http_1 = require("../../lib/http");
const orders_schema_1 = require("./orders.schema");
const service = __importStar(require("./orders.service"));
exports.checkout = (0, http_1.asyncHandler)(async (req, res) => res.status(201).json({ data: await service.checkout(req.auth.userId, orders_schema_1.checkoutSchema.parse(req.body)) }));
exports.list = (0, http_1.asyncHandler)(async (req, res) => res.json(await service.list(req.auth.userId, req.auth.role, orders_schema_1.orderListQuerySchema.parse(req.query))));
exports.get = (0, http_1.asyncHandler)(async (req, res) => res.json({ data: await service.get(String(req.params.id), req.auth) }));
exports.cancel = (0, http_1.asyncHandler)(async (req, res) => res.json({ data: await service.cancel(String(req.params.id), req.auth.userId) }));
//# sourceMappingURL=orders.controller.js.map