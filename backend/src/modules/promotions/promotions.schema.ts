import { z } from "zod";
export const promotionSchema = z.object({ name: z.string().min(1), code: z.string().trim().toUpperCase().optional(), description: z.string().optional(), type: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]), value: z.number().positive(), minimumOrderValue: z.number().nonnegative().optional(), maximumDiscount: z.number().nonnegative().optional(), startsAt: z.coerce.date().optional(), endsAt: z.coerce.date().optional(), usageLimit: z.number().int().positive().optional(), isActive: z.boolean().default(true) });
export type PromotionInput = z.infer<typeof promotionSchema>;
