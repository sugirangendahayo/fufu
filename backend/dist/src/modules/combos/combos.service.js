"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.list = void 0;
const database_1 = require("../../config/database");
const serialization_1 = require("../../lib/serialization");
const list = async () => (0, serialization_1.serialize)(await database_1.prisma.combo.findMany({ where: { isActive: true }, include: { items: { include: { product: true } } } }));
exports.list = list;
//# sourceMappingURL=combos.service.js.map