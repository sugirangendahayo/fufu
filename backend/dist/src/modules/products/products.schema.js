"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cuid = exports.productListQuerySchema = void 0;
const zod_1 = require("zod");
const cuid = zod_1.z.string().cuid();
exports.cuid = cuid;
// ── Public query ──────────────────────────────────────────────────────────────
exports.productListQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    category: zod_1.z.string().optional(),
    available: zod_1.z.enum(["true", "false"]).optional(),
    featured: zod_1.z.enum(["true", "false"]).optional(),
    search: zod_1.z.string().max(100).optional(),
});
//# sourceMappingURL=products.schema.js.map