"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addressBodySchema = void 0;
const zod_1 = require("zod");
exports.addressBodySchema = zod_1.z.object({
    label: zod_1.z.string().max(60).optional(),
    recipientName: zod_1.z.string().min(1).max(120),
    phone: zod_1.z.string(),
    province: zod_1.z.string().min(1).default("Kigali"),
    district: zod_1.z.string().min(1),
    sector: zod_1.z.string().optional(),
    cell: zod_1.z.string().optional(),
    street: zod_1.z.string().optional(),
    building: zod_1.z.string().optional(),
    instructions: zod_1.z.string().max(500).optional(),
    isDefault: zod_1.z.boolean().optional(),
});
//# sourceMappingURL=addresses.schema.js.map