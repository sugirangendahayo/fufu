import { prisma } from "../../config/database";
import { serialize } from "../../lib/serialization";
import { transition } from "../orders/orders.service";
export const listOrders = async (riderId: string) => serialize(await prisma.order.findMany({ where: { riderId, status: { in: ["READY", "OUT_FOR_DELIVERY"] } }, include: { deliveryAddress: true, items: true }, orderBy: { createdAt: "asc" } }));
export const updateOrderStatus = async (id: string, status: "OUT_FOR_DELIVERY" | "DELIVERED", riderId: string) => serialize(await transition(id, status, { userId: riderId, role: "RIDER" }));
