import { ProductStatus } from "../../../generated/prisma/client";
import { prisma } from "../../config/database";
import { AppError } from "../../lib/http";
import { serialize } from "../../lib/serialization";

export const list = async () => serialize(await prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }));
export async function get(key: string) {
  const category = await prisma.category.findFirst({ where: { OR: [{ id: key }, { slug: key }], isActive: true }, include: { products: { where: { status: ProductStatus.AVAILABLE }, include: { variants: { where: { isActive: true } } }, orderBy: { name: "asc" } } } });
  if (!category) throw new AppError(404, "Category not found", "NOT_FOUND");
  return serialize(category);
}
