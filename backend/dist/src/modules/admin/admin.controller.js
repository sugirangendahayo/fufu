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
exports.updateOrderStatus = exports.assignRider = exports.createVariant = exports.updateProduct = exports.createProduct = exports.updateCategory = exports.createCategory = void 0;
const http_1 = require("../../lib/http");
const admin_schema_1 = require("./admin.schema");
const service = __importStar(require("./admin.service"));
exports.createCategory = (0, http_1.asyncHandler)(async (req, res) => res.status(201).json({ data: await service.createCategory(admin_schema_1.categorySchema.parse(req.body)) }));
exports.updateCategory = (0, http_1.asyncHandler)(async (req, res) => res.json({ data: await service.updateCategory(String(req.params.id), admin_schema_1.categorySchema.partial().parse(req.body)) }));
exports.createProduct = (0, http_1.asyncHandler)(async (req, res) => res.status(201).json({ data: await service.createProduct(admin_schema_1.productSchema.parse(req.body)) }));
exports.updateProduct = (0, http_1.asyncHandler)(async (req, res) => res.json({ data: await service.updateProduct(String(req.params.id), admin_schema_1.productSchema.partial().parse(req.body)) }));
exports.createVariant = (0, http_1.asyncHandler)(async (req, res) => res.status(201).json({ data: await service.createVariant(String(req.params.id), admin_schema_1.variantSchema.parse(req.body)) }));
exports.assignRider = (0, http_1.asyncHandler)(async (req, res) => res.json({ data: await service.assignRider(String(req.params.id), admin_schema_1.riderSchema.parse(req.body), req.auth.userId) }));
exports.updateOrderStatus = (0, http_1.asyncHandler)(async (req, res) => res.json({ data: await service.updateOrderStatus(String(req.params.id), admin_schema_1.orderStatusSchema.parse(req.body).status, req.auth) }));
//# sourceMappingURL=admin.controller.js.map