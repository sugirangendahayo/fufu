import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../config/database";
import { serialize } from "../../lib/serialization";
import type { PromotionInput } from "./promotions.schema";
export async function create(input: PromotionInput) { const decimal = (value: number) => new Prisma.Decimal(value); return serialize(await prisma.promotion.create({ data: { ...input, value: decimal(input.value), minimumOrderValue: input.minimumOrderValue === undefined ? undefined : decimal(input.minimumOrderValue), maximumDiscount: input.maximumDiscount === undefined ? undefined : decimal(input.maximumDiscount) } })); }
