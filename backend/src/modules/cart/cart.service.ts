import { Prisma, ProductStatus } from "../../../generated/prisma/client";
import { prisma } from "../../config/database";
import { AppError } from "../../lib/http";
import { serialize } from "../../lib/serialization";
import type { AddCartItem, UpdateCartItem } from "./cart.schema";

export async function getCart(userId: string) {
  return prisma.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
    include: {
      items: {
        include: { product: { include: { inventory: true } }, variant: true },
      },
    },
  });
}
function summary(cart: Awaited<ReturnType<typeof getCart>>) {
  const items = cart.items.map((item) => {
    const unitPrice = item.variant?.price ?? item.product.basePrice;
    return { ...item, unitPrice, lineTotal: unitPrice.mul(item.quantity) };
  });
  const subtotal = items.reduce(
    (total, item) => total.add(item.lineTotal),
    new Prisma.Decimal(0),
  );
  return serialize({
    ...cart,
    items,
    subtotal,
    totalQuantity: items.reduce((total, item) => total + item.quantity, 0),
  });
}
async function validProduct(productId: string, variantId?: string) {
  const product = await prisma.product.findFirst({
    where: { id: productId, status: ProductStatus.AVAILABLE },
    include: { variants: true },
  });
  if (!product)
    throw new AppError(404, "Product is unavailable", "PRODUCT_UNAVAILABLE");
  if (
    variantId &&
    !product.variants.some(
      (variant) => variant.id === variantId && variant.isActive,
    )
  )
    throw new AppError(
      422,
      "Variant does not belong to this available product",
      "INVALID_VARIANT",
    );
}
export const show = async (userId: string) => summary(await getCart(userId));
export async function add(userId: string, input: AddCartItem) {
  await validProduct(input.productId, input.variantId);
  const cart = await getCart(userId);
  const existing = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId: input.productId,
      variantId: input.variantId ?? null,
    },
  });
  return existing
    ? prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: { increment: input.quantity } },
      })
    : prisma.cartItem.create({ data: { cartId: cart.id, ...input } });
}
export async function update(
  userId: string,
  itemId: string,
  input: UpdateCartItem,
) {
  const cart = await getCart(userId);
  const existing = await prisma.cartItem.findFirst({
    where: { id: itemId, cartId: cart.id },
  });
  if (!existing) throw new AppError(404, "Cart item not found", "NOT_FOUND");
  await validProduct(existing.productId, input.variantId ?? undefined);
  return prisma.cartItem.update({ where: { id: existing.id }, data: input });
}
export async function remove(userId: string, itemId: string) {
  const cart = await getCart(userId);
  const result = await prisma.cartItem.deleteMany({
    where: { id: itemId, cartId: cart.id },
  });
  if (!result.count)
    throw new AppError(404, "Cart item not found", "NOT_FOUND");
}
export async function clear(userId: string) {
  const cart = await getCart(userId);
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
}
