import { z } from "zod";
import { cuid } from "../products/products.schema";
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const categorySchema = z.object({ name: z.string().min(1).max(80), slug, imageUrl: z.string().url().optional(), sortOrder: z.number().int().nonnegative().default(0), isActive: z.boolean().default(true) });
export const productSchema = z.object({ categoryId: cuid, name: z.string().min(1).max(120), slug, description: z.string().max(2000).optional().nullable(), imageUrl: z.string().url().optional().nullable(), basePrice: z.number().nonnegative(), status: z.enum(["AVAILABLE", "UNAVAILABLE", "ARCHIVED"]).optional(), isFeatured: z.boolean().optional() });
export const variantSchema = z.object({ name: z.string().min(1).max(80), price: z.number().nonnegative(), isDefault: z.boolean().default(false), isActive: z.boolean().default(true) });
export const riderSchema = z.object({ riderId: cuid });
export const orderStatusSchema = z.object({ status: z.enum(["CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "DELIVERED", "COMPLETED", "CANCELLED"]) });
