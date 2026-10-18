import { z } from "zod";
import { cuid } from "../products/products.schema";

export const initializePaymentSchema = z.object({ orderId: cuid });

export const webhookBodySchema = z
  .object({
    id: z.union([z.string(), z.number()]),
    data: z
      .object({
        tx_ref: z.string().optional(),
        status: z.string().optional(),
      })
      .optional(),
  })
  .passthrough();

export type WebhookBody = z.infer<typeof webhookBodySchema>;
