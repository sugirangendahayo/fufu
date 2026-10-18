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
exports.flutterwaveWebhook = exports.initialize = exports.get = void 0;
const http_1 = require("../../lib/http");
const payments_schema_1 = require("./payments.schema");
const service = __importStar(require("./payments.service"));
exports.get = (0, http_1.asyncHandler)(async (req, res) => res.json({ data: await service.get(String(req.params.id), req.auth) }));
exports.initialize = (0, http_1.asyncHandler)(async (req, res) => { const data = await service.initialize(payments_schema_1.initializePaymentSchema.parse(req.body).orderId, req.auth.userId); res.status(501).json({ error: { code: "PAYMENT_INITIALIZATION_PENDING", message: "Configure Flutterwave API verification before enabling online payments" }, data }); });
exports.flutterwaveWebhook = (0, http_1.asyncHandler)(async (req, res) => { const data = await service.webhook(req.header("verif-hash"), payments_schema_1.webhookBodySchema.parse(req.body)); res.status(data.duplicate ? 200 : 202).json({ data }); });
//# sourceMappingURL=payments.controller.js.map