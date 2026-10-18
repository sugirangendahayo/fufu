"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.list = list;
exports.get = get;
const client_1 = require("../../../generated/prisma/client");
const database_1 = require("../../config/database");
const http_1 = require("../../lib/http");
const serialization_1 = require("../../lib/serialization");
async function list(query) {
    const where = { status: query.available === "false" ? undefined : client_1.ProductStatus.AVAILABLE, ...(query.category ? { category: { is: { OR: [{ id: query.category }, { slug: query.category }] } } } : {}), ...(query.featured ? { isFeatured: query.featured === "true" } : {}), ...(query.search ? { name: { contains: query.search, mode: "insensitive" } } : {}) };
    const [items, total] = await database_1.prisma.$transaction([database_1.prisma.product.findMany({ where, include: { category: true, variants: { where: { isActive: true } }, inventory: true }, skip: (query.page - 1) * query.limit, take: query.limit, orderBy: { createdAt: "desc" } }), database_1.prisma.product.count({ where })]);
    return { data: (0, serialization_1.serialize)(items), meta: { page: query.page, limit: query.limit, total, pages: Math.ceil(total / query.limit) } };
}
async function get(key) {
    const product = await database_1.prisma.product.findFirst({ where: { OR: [{ id: key }, { slug: key }], status: client_1.ProductStatus.AVAILABLE }, include: { category: true, variants: { where: { isActive: true } }, inventory: true } });
    if (!product)
        throw new http_1.AppError(404, "Product not found", "NOT_FOUND");
    return (0, serialization_1.serialize)(product);
}
//# sourceMappingURL=products.service.js.map