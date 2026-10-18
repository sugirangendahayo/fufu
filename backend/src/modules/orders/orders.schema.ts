import { z } from "zod";
import { cuid } from "../products/products.schema";

export const checkoutSchema = z.object({
  type: z.enum(["DELIVERY", "PICKUP"]),
  addressId: cuid.optional(),
  promotionCode: z.string().trim().min(1).max(60).optional(),
  paymentMethod: z.enum([
    "FLUTTERWAVE",
    "MOMO",
    "CARD",
    "CASH_ON_DELIVERY",
    "PAY_ON_PICKUP",
  ]),
  notes: z.string().max(500).optional(),
  /** Reserved for future idempotent checkout — not yet enforced server-side. */
  idempotencyKey: z.string().min(8).max(128).optional(),
});

export const orderListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type OrderListQuery = z.infer<typeof orderListQuerySchema>;
