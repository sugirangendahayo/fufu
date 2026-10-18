import { z } from "zod";

export const addressBodySchema = z.object({
  label: z.string().max(60).optional(),
  recipientName: z.string().min(1).max(120),
  phone: z.string(),
  province: z.string().min(1).default("Kigali"),
  district: z.string().min(1),
  sector: z.string().optional(),
  cell: z.string().optional(),
  street: z.string().optional(),
  building: z.string().optional(),
  instructions: z.string().max(500).optional(),
  isDefault: z.boolean().optional(),
});

export type AddressBody = z.infer<typeof addressBodySchema>;
export type PartialAddressBody = Partial<AddressBody>;
