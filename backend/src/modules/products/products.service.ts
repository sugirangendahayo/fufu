import { Prisma, ProductStatus } from "../../../generated/prisma/client";
import { prisma } from "../../config/database";
import { AppError } from "../../lib/http";
import { serialize } from "../../lib/serialization";
import type { ProductListQuery } from "./products.schema";

export async function list(query: ProductListQuery) {
  const where: Prisma.ProductWhereInput = { status: query.available === "false" ? undefined : ProductStatus.AVAILABLE, ...(query.category ? { category: { is: { OR: [{ id: query.category }, { slug: query.category }] } } } : {}), ...(query.featured ? { isFeatured: query.featured === "true" } : {}), ...(query.search ? { name: { contains: query.search, mode: "insensitive" } } : {}) };
  const [items, total] = await prisma.$transaction([prisma.product.findMany({ where, include: { category: true, variants: { where: { isActive: true } }, inventory: true }, skip: (query.page - 1) * query.limit, take: query.limit, orderBy: { createdAt: "desc" } }), prisma.product.count({ where })]);
  return { data: serialize(items), meta: { page: query.page, limit: query.limit, total, pages: Math.ceil(total / query.limit) } };
}
export async function get(key: string) {
  const product = await prisma.product.findFirst({ where: { OR: [{ id: key }, { slug: key }], status: ProductStatus.AVAILABLE }, include: { category: true, variants: { where: { isActive: true } }, inventory: true } });
  if (!product) throw new AppError(404, "Product not found", "NOT_FOUND");
  return serialize(product);
}
