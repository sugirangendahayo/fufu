"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.promotionSchema = void 0;
const zod_1 = require("zod");
exports.promotionSchema = zod_1.z.object({ name: zod_1.z.string().min(1), code: zod_1.z.string().trim().toUpperCase().optional(), description: zod_1.z.string().optional(), type: zod_1.z.enum(["PERCENTAGE", "FIXED_AMOUNT"]), value: zod_1.z.number().positive(), minimumOrderValue: zod_1.z.number().nonnegative().optional(), maximumDiscount: zod_1.z.number().nonnegative().optional(), startsAt: zod_1.z.coerce.date().optional(), endsAt: zod_1.z.coerce.date().optional(), usageLimit: zod_1.z.number().int().positive().optional(), isActive: zod_1.z.boolean().default(true) });
//# sourceMappingURL=promotions.schema.js.map