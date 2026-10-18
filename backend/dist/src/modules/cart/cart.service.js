"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.show = void 0;
exports.getCart = getCart;
exports.add = add;
exports.update = update;
exports.remove = remove;
exports.clear = clear;
const client_1 = require("../../../generated/prisma/client");
const database_1 = require("../../config/database");
const http_1 = require("../../lib/http");
const serialization_1 = require("../../lib/serialization");
async function getCart(userId) {
    return database_1.prisma.cart.upsert({
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
function summary(cart) {
    const items = cart.items.map((item) => {
        const unitPrice = item.variant?.price ?? item.product.basePrice;
        return { ...item, unitPrice, lineTotal: unitPrice.mul(item.quantity) };
    });
    const subtotal = items.reduce((total, item) => total.add(item.lineTotal), new client_1.Prisma.Decimal(0));
    return (0, serialization_1.serialize)({
        ...cart,
        items,
        subtotal,
        totalQuantity: items.reduce((total, item) => total + item.quantity, 0),
    });
}
async function validProduct(productId, variantId) {
    const product = await database_1.prisma.product.findFirst({
        where: { id: productId, status: client_1.ProductStatus.AVAILABLE },
        include: { variants: true },
    });
    if (!product)
        throw new http_1.AppError(404, "Product is unavailable", "PRODUCT_UNAVAILABLE");
    if (variantId &&
        !product.variants.some((variant) => variant.id === variantId && variant.isActive))
        throw new http_1.AppError(422, "Variant does not belong to this available product", "INVALID_VARIANT");
}
const show = async (userId) => summary(await getCart(userId));
exports.show = show;
async function add(userId, input) {
    await validProduct(input.productId, input.variantId);
    const cart = await getCart(userId);
    const existing = await database_1.prisma.cartItem.findFirst({
        where: {
            cartId: cart.id,
            productId: input.productId,
            variantId: input.variantId ?? null,
        },
    });
    return existing
        ? database_1.prisma.cartItem.update({
            where: { id: existing.id },
            data: { quantity: { increment: input.quantity } },
        })
        : database_1.prisma.cartItem.create({ data: { cartId: cart.id, ...input } });
}
async function update(userId, itemId, input) {
    const cart = await getCart(userId);
    const existing = await database_1.prisma.cartItem.findFirst({
        where: { id: itemId, cartId: cart.id },
    });
    if (!existing)
        throw new http_1.AppError(404, "Cart item not found", "NOT_FOUND");
    await validProduct(existing.productId, input.variantId ?? undefined);
    return database_1.prisma.cartItem.update({ where: { id: existing.id }, data: input });
}
async function remove(userId, itemId) {
    const cart = await getCart(userId);
    const result = await database_1.prisma.cartItem.deleteMany({
        where: { id: itemId, cartId: cart.id },
    });
    if (!result.count)
        throw new http_1.AppError(404, "Cart item not found", "NOT_FOUND");
}
async function clear(userId) {
    const cart = await getCart(userId);
    await database_1.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
}
//# sourceMappingURL=cart.service.js.map