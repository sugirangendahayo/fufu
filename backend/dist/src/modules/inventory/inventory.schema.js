"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventorySchema = void 0;
const zod_1 = require("zod");
exports.inventorySchema = zod_1.z.object({ stockQuantity: zod_1.z.number().int().nonnegative(), lowStockThreshold: zod_1.z.number().int().nonnegative().optional() });
//# sourceMappingURL=inventory.schema.js.map