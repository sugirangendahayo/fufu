"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderStatusSchema = exports.riderSchema = exports.variantSchema = exports.productSchema = exports.categorySchema = void 0;
const zod_1 = require("zod");
const products_schema_1 = require("../products/products.schema");
const slug = zod_1.z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
exports.categorySchema = zod_1.z.object({ name: zod_1.z.string().min(1).max(80), slug, imageUrl: zod_1.z.string().url().optional(), sortOrder: zod_1.z.number().int().nonnegative().default(0), isActive: zod_1.z.boolean().default(true) });
exports.productSchema = zod_1.z.object({ categoryId: products_schema_1.cuid, name: zod_1.z.string().min(1).max(120), slug, description: zod_1.z.string().max(2000).optional().nullable(), imageUrl: zod_1.z.string().url().optional().nullable(), basePrice: zod_1.z.number().nonnegative(), status: zod_1.z.enum(["AVAILABLE", "UNAVAILABLE", "ARCHIVED"]).optional(), isFeatured: zod_1.z.boolean().optional() });
exports.variantSchema = zod_1.z.object({ name: zod_1.z.string().min(1).max(80), price: zod_1.z.number().nonnegative(), isDefault: zod_1.z.boolean().default(false), isActive: zod_1.z.boolean().default(true) });
exports.riderSchema = zod_1.z.object({ riderId: products_schema_1.cuid });
exports.orderStatusSchema = zod_1.z.object({ status: zod_1.z.enum(["CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "DELIVERED", "COMPLETED", "CANCELLED"]) });
//# sourceMappingURL=admin.schema.js.map