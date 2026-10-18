"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCartItemSchema = exports.addCartItemSchema = void 0;
const zod_1 = require("zod");
const products_schema_1 = require("../products/products.schema");
exports.addCartItemSchema = zod_1.z.object({
    productId: products_schema_1.cuid,
    variantId: products_schema_1.cuid.optional(),
    quantity: zod_1.z.number().int().min(1).max(100),
});
exports.updateCartItemSchema = zod_1.z.object({
    quantity: zod_1.z.number().int().min(1).max(100),
    variantId: products_schema_1.cuid.optional().nullable(),
});
//# sourceMappingURL=cart.schema.js.map