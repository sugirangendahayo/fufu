"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.listOrders = void 0;
const database_1 = require("../../config/database");
const serialization_1 = require("../../lib/serialization");
const orders_service_1 = require("../orders/orders.service");
const listOrders = async (riderId) => (0, serialization_1.serialize)(await database_1.prisma.order.findMany({ where: { riderId, status: { in: ["READY", "OUT_FOR_DELIVERY"] } }, include: { deliveryAddress: true, items: true }, orderBy: { createdAt: "asc" } }));
exports.listOrders = listOrders;
const updateOrderStatus = async (id, status, riderId) => (0, serialization_1.serialize)(await (0, orders_service_1.transition)(id, status, { userId: riderId, role: "RIDER" }));
exports.updateOrderStatus = updateOrderStatus;
//# sourceMappingURL=riders.service.js.map