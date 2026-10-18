import { z } from "zod";

const cuid = z.string().cuid();

// ── Public query ──────────────────────────────────────────────────────────────

export const productListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  category: z.string().optional(),
  available: z.enum(["true", "false"]).optional(),
  featured: z.enum(["true", "false"]).optional(),
  search: z.string().max(100).optional(),
});

export type ProductListQuery = z.infer<typeof productListQuerySchema>;

// ── Shared helpers ────────────────────────────────────────────────────────────

/** CUID id validator — reused in cart and orders schemas. */
export { cuid };
