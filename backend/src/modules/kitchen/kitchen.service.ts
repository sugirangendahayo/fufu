import { prisma } from "../../config/database";
import { serialize } from "../../lib/serialization";
import { transition } from "../orders/orders.service";
import type { UserRole } from "../../../generated/prisma/client";
export const listOrders = async () => serialize(await prisma.order.findMany({ where: { status: { in: ["CONFIRMED", "PREPARING"] } }, include: { items: true }, orderBy: { createdAt: "asc" } }));
export const updateOrderStatus = async (id: string, status: "PREPARING" | "READY", actor: { userId: string; role: UserRole }) => serialize(await transition(id, status, actor));
