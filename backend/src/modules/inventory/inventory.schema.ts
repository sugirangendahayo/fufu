import { z } from "zod";
export const inventorySchema = z.object({ stockQuantity: z.number().int().nonnegative(), lowStockThreshold: z.number().int().nonnegative().optional() });
export type InventoryInput = z.infer<typeof inventorySchema>;
