import { z } from "zod";
import { cuid } from "../products/products.schema";

export const addCartItemSchema = z.object({
  productId: cuid,
  variantId: cuid.optional(),
  quantity: z.number().int().min(1).max(100),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1).max(100),
  variantId: cuid.optional().nullable(),
});

export type AddCartItem = z.infer<typeof addCartItemSchema>;
export type UpdateCartItem = z.infer<typeof updateCartItemSchema>;
