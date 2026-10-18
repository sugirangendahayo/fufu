"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.list = void 0;
exports.get = get;
const client_1 = require("../../../generated/prisma/client");
const database_1 = require("../../config/database");
const http_1 = require("../../lib/http");
const serialization_1 = require("../../lib/serialization");
const list = async () => (0, serialization_1.serialize)(await database_1.prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }));
exports.list = list;
async function get(key) {
    const category = await database_1.prisma.category.findFirst({ where: { OR: [{ id: key }, { slug: key }], isActive: true }, include: { products: { where: { status: client_1.ProductStatus.AVAILABLE }, include: { variants: { where: { isActive: true } } }, orderBy: { name: "asc" } } } });
    if (!category)
        throw new http_1.AppError(404, "Category not found", "NOT_FOUND");
    return (0, serialization_1.serialize)(category);
}
//# sourceMappingURL=categories.service.js.map