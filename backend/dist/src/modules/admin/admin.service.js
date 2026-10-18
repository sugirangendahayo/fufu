"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.updateProduct = exports.createProduct = exports.updateCategory = exports.createCategory = void 0;
exports.createVariant = createVariant;
exports.assignRider = assignRider;
const client_1 = require("../../../generated/prisma/client");
const database_1 = require("../../config/database");
const http_1 = require("../../lib/http");
const serialization_1 = require("../../lib/serialization");
const orders_service_1 = require("../orders/orders.service");
const decimal = (value) => new client_1.Prisma.Decimal(value);
const createCategory = (input) => database_1.prisma.category.create({ data: input });
exports.createCategory = createCategory;
const updateCategory = (id, input) => database_1.prisma.category.update({ where: { id }, data: input });
exports.updateCategory = updateCategory;
const createProduct = async (input) => (0, serialization_1.serialize)(await database_1.prisma.product.create({ data: { ...input, basePrice: decimal(input.basePrice), inventory: { create: { stockQuantity: 0 } } } }));
exports.createProduct = createProduct;
const updateProduct = async (id, input) => (0, serialization_1.serialize)(await database_1.prisma.product.update({ where: { id }, data: { ...input, ...(input.basePrice === undefined ? {} : { basePrice: decimal(input.basePrice) }) } }));
exports.updateProduct = updateProduct;
async function createVariant(productId, input) { if (input.isDefault)
    await database_1.prisma.productVariant.updateMany({ where: { productId }, data: { isDefault: false } }); return (0, serialization_1.serialize)(await database_1.prisma.productVariant.create({ data: { productId, ...input, price: decimal(input.price) } })); }
async function assignRider(orderId, input, assignedBy) { const [order, rider] = await Promise.all([database_1.prisma.order.findUnique({ where: { id: orderId } }), database_1.prisma.user.findFirst({ where: { id: input.riderId, role: "RIDER", isActive: true } })]); if (!order || order.type !== "DELIVERY" || !["READY", "OUT_FOR_DELIVERY"].includes(order.status))
    throw new http_1.AppError(422, "Order is not ready for rider assignment", "INVALID_ASSIGNMENT"); if (!rider)
    throw new http_1.AppError(422, "Eligible rider not found", "INVALID_RIDER"); return database_1.prisma.$transaction(async (tx) => { await tx.order.update({ where: { id: order.id }, data: { riderId: rider.id } }); return tx.riderAssignment.upsert({ where: { orderId: order.id }, create: { orderId: order.id, riderId: rider.id, assignedBy }, update: { riderId: rider.id, assignedBy, assignedAt: new Date() } }); }); }
const updateOrderStatus = async (id, status, actor) => (0, serialization_1.serialize)(await (0, orders_service_1.transition)(id, status, actor));
exports.updateOrderStatus = updateOrderStatus;
//# sourceMappingURL=admin.service.js.map