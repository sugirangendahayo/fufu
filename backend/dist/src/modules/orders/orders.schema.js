"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderListQuerySchema = exports.checkoutSchema = void 0;
const zod_1 = require("zod");
const products_schema_1 = require("../products/products.schema");
exports.checkoutSchema = zod_1.z.object({
    type: zod_1.z.enum(["DELIVERY", "PICKUP"]),
    addressId: products_schema_1.cuid.optional(),
    promotionCode: zod_1.z.string().trim().min(1).max(60).optional(),
    paymentMethod: zod_1.z.enum([
        "FLUTTERWAVE",
        "MOMO",
        "CARD",
        "CASH_ON_DELIVERY",
        "PAY_ON_PICKUP",
    ]),
    notes: zod_1.z.string().max(500).optional(),
    /** Reserved for future idempotent checkout — not yet enforced server-side. */
    idempotencyKey: zod_1.z.string().min(8).max(128).optional(),
});
exports.orderListQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
});
//# sourceMappingURL=orders.schema.js.map