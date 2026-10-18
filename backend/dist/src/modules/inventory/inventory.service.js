"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lowStock = exports.update = void 0;
const database_1 = require("../../config/database");
const serialization_1 = require("../../lib/serialization");
const update = (productId, input) => database_1.prisma.inventory.upsert({ where: { productId }, create: { productId, stockQuantity: input.stockQuantity, lowStockThreshold: input.lowStockThreshold ?? 5 }, update: input });
exports.update = update;
const lowStock = async () => (0, serialization_1.serialize)(await database_1.prisma.inventory.findMany({ where: { stockQuantity: { lte: 5 } }, include: { product: true } }));
exports.lowStock = lowStock;
//# sourceMappingURL=inventory.service.js.map