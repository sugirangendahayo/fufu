import { prisma } from "../../config/database";
import { serialize } from "../../lib/serialization";
import type { InventoryInput } from "./inventory.schema";
export const update = (productId: string, input: InventoryInput) => prisma.inventory.upsert({ where: { productId }, create: { productId, stockQuantity: input.stockQuantity, lowStockThreshold: input.lowStockThreshold ?? 5 }, update: input });
export const lowStock = async () => serialize(await prisma.inventory.findMany({ where: { stockQuantity: { lte: 5 } }, include: { product: true } }));
