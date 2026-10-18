import { Prisma, type UserRole } from "../../../generated/prisma/client";
import { prisma } from "../../config/database";
import { AppError } from "../../lib/http";
import { serialize } from "../../lib/serialization";
import { transition } from "../orders/orders.service";
import type { z } from "zod";
import type { categorySchema, productSchema, riderSchema, variantSchema } from "./admin.schema";
const decimal = (value: number) => new Prisma.Decimal(value);
export const createCategory = (input: z.infer<typeof categorySchema>) => prisma.category.create({ data: input });
export const updateCategory = (id: string, input: Partial<z.infer<typeof categorySchema>>) => prisma.category.update({ where: { id }, data: input });
export const createProduct = async (input: z.infer<typeof productSchema>) => serialize(await prisma.product.create({ data: { ...input, basePrice: decimal(input.basePrice), inventory: { create: { stockQuantity: 0 } } } }));
export const updateProduct = async (id: string, input: Partial<z.infer<typeof productSchema>>) => serialize(await prisma.product.update({ where: { id }, data: { ...input, ...(input.basePrice === undefined ? {} : { basePrice: decimal(input.basePrice) }) } }));
export async function createVariant(productId: string, input: z.infer<typeof variantSchema>) { if (input.isDefault) await prisma.productVariant.updateMany({ where: { productId }, data: { isDefault: false } }); return serialize(await prisma.productVariant.create({ data: { productId, ...input, price: decimal(input.price) } })); }
export async function assignRider(orderId: string, input: z.infer<typeof riderSchema>, assignedBy: string) { const [order, rider] = await Promise.all([prisma.order.findUnique({ where: { id: orderId } }), prisma.user.findFirst({ where: { id: input.riderId, role: "RIDER", isActive: true } })]); if (!order || order.type !== "DELIVERY" || !(["READY", "OUT_FOR_DELIVERY"] as string[]).includes(order.status)) throw new AppError(422, "Order is not ready for rider assignment", "INVALID_ASSIGNMENT"); if (!rider) throw new AppError(422, "Eligible rider not found", "INVALID_RIDER"); return prisma.$transaction(async (tx) => { await tx.order.update({ where: { id: order.id }, data: { riderId: rider.id } }); return tx.riderAssignment.upsert({ where: { orderId: order.id }, create: { orderId: order.id, riderId: rider.id, assignedBy }, update: { riderId: rider.id, assignedBy, assignedAt: new Date() } }); }); }
export const updateOrderStatus = async (id: string, status: Parameters<typeof transition>[1], actor: { userId: string; role: UserRole }) => serialize(await transition(id, status, actor));
