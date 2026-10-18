"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookBodySchema = exports.initializePaymentSchema = void 0;
const zod_1 = require("zod");
const products_schema_1 = require("../products/products.schema");
exports.initializePaymentSchema = zod_1.z.object({ orderId: products_schema_1.cuid });
exports.webhookBodySchema = zod_1.z
    .object({
    id: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]),
    data: zod_1.z
        .object({
        tx_ref: zod_1.z.string().optional(),
        status: zod_1.z.string().optional(),
    })
        .optional(),
})
    .passthrough();
//# sourceMappingURL=payments.schema.js.map