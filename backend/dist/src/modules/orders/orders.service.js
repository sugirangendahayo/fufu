"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkout = checkout;
exports.list = list;
exports.get = get;
exports.transition = transition;
exports.cancel = cancel;
const client_1 = require("../../../generated/prisma/client");
const database_1 = require("../../config/database");
const env_1 = require("../../config/env");
const http_1 = require("../../lib/http");
const security_1 = require("../../lib/security");
const serialization_1 = require("../../lib/serialization");
const orderNumber = () => `FF-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${(0, security_1.randomRef)().slice(0, 6).toUpperCase()}`;
async function calculatePromotion(tx, code, subtotal) {
    if (!code)
        return { promotion: null, discount: new client_1.Prisma.Decimal(0) };
    const now = new Date();
    const promotion = await tx.promotion.findUnique({ where: { code: code.toUpperCase() } });
    if (!promotion || !promotion.isActive || (promotion.startsAt && promotion.startsAt > now) || (promotion.endsAt && promotion.endsAt < now) || (promotion.usageLimit !== null && promotion.usageCount >= promotion.usageLimit) || (promotion.minimumOrderValue && subtotal.lessThan(promotion.minimumOrderValue)))
        throw new http_1.AppError(422, "Promotion is not valid for this order", "INVALID_PROMOTION");
    const raw = promotion.type === "PERCENTAGE" ? subtotal.mul(promotion.value).div(100) : promotion.value;
    return { promotion, discount: client_1.Prisma.Decimal.min(raw, promotion.maximumDiscount ?? raw, subtotal).toDecimalPlaces(2, client_1.Prisma.Decimal.ROUND_HALF_UP) };
}
async function checkout(userId, body) {
    const order = await database_1.prisma.$transaction(async (tx) => {
        const cart = await tx.cart.findUnique({ where: { userId }, include: { items: { include: { product: { include: { inventory: true } }, variant: true } } } });
        if (!cart?.items.length)
            throw new http_1.AppError(422, "Cart is empty", "EMPTY_CART");
        const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
        let addressId;
        if (body.type === "DELIVERY") {
            if (!body.addressId)
                throw new http_1.AppError(422, "A delivery address is required", "ADDRESS_REQUIRED");
            const address = await tx.address.findFirst({ where: { id: body.addressId, userId } });
            if (!address)
                throw new http_1.AppError(422, "Invalid delivery address", "INVALID_ADDRESS");
            addressId = address.id;
        }
        const lines = cart.items.map((item) => { if (item.product.status !== "AVAILABLE" || (item.variant && (!item.variant.isActive || item.variant.productId !== item.productId)))
            throw new http_1.AppError(422, "A cart item is no longer available", "PRODUCT_UNAVAILABLE"); if (!item.product.inventory || item.product.inventory.stockQuantity < item.quantity)
            throw new http_1.AppError(422, `Insufficient stock for ${item.product.name}`, "INSUFFICIENT_STOCK"); const unitPrice = item.variant?.price ?? item.product.basePrice; return { item, unitPrice, lineTotal: unitPrice.mul(item.quantity) }; });
        const subtotal = lines.reduce((sum, line) => sum.add(line.lineTotal), new client_1.Prisma.Decimal(0));
        const { promotion, discount } = await calculatePromotion(tx, body.promotionCode, subtotal);
        const deliveryFee = new client_1.Prisma.Decimal(body.type === "DELIVERY" ? env_1.env.DELIVERY_FEE_RWF : 0);
        const totalAmount = client_1.Prisma.Decimal.max(new client_1.Prisma.Decimal(0), subtotal.minus(discount).add(deliveryFee));
        for (const line of lines) {
            const adjusted = await tx.inventory.updateMany({ where: { productId: line.item.productId, stockQuantity: { gte: line.item.quantity } }, data: { stockQuantity: { decrement: line.item.quantity } } });
            if (adjusted.count !== 1)
                throw new http_1.AppError(409, "Inventory changed; please review your cart", "STOCK_CHANGED");
        }
        if (promotion) {
            const increment = await tx.promotion.updateMany({ where: { id: promotion.id, ...(promotion.usageLimit !== null ? { usageCount: { lt: promotion.usageLimit } } : {}) }, data: { usageCount: { increment: 1 } } });
            if (increment.count !== 1)
                throw new http_1.AppError(409, "Promotion limit was reached", "PROMOTION_EXHAUSTED");
        }
        const created = await tx.order.create({ data: { orderNumber: orderNumber(), userId, type: body.type, deliveryAddressId: addressId, customerName: `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`, customerPhone: user.phone, subtotal, discountAmount: discount, deliveryFee, totalAmount, notes: body.notes, promotionId: promotion?.id, promotionCode: promotion?.code, items: { create: lines.map((line) => ({ productId: line.item.productId, productName: line.item.product.name, variantName: line.item.variant?.name, quantity: line.item.quantity, unitPrice: line.unitPrice, lineTotal: line.lineTotal })) }, payments: { create: { method: body.paymentMethod, amount: totalAmount } } }, include: { items: true, payments: true } });
        if (promotion)
            await tx.promotionRedemption.create({ data: { promotionId: promotion.id, userId, orderId: created.id, discount } });
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
        return created;
    }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.Serializable });
    return (0, serialization_1.serialize)(order);
}
async function list(userId, role, query) {
    const where = role === "ADMIN" ? {} : { userId };
    const [items, total] = await database_1.prisma.$transaction([database_1.prisma.order.findMany({ where, include: { items: true, payments: true }, orderBy: { createdAt: "desc" }, skip: (query.page - 1) * query.limit, take: query.limit }), database_1.prisma.order.count({ where })]);
    return { data: (0, serialization_1.serialize)(items), meta: { page: query.page, limit: query.limit, total } };
}
async function get(id, actor) {
    const order = await database_1.prisma.order.findUnique({ where: { id }, include: { items: true, payments: true, deliveryAddress: true, riderAssignment: true } });
    if (!order || (actor.role === "CUSTOMER" && order.userId !== actor.userId) || (actor.role === "RIDER" && order.riderId !== actor.userId))
        throw new http_1.AppError(404, "Order not found", "NOT_FOUND");
    return (0, serialization_1.serialize)(order);
}
const transitions = { PENDING: ["CONFIRMED", "CANCELLED"], CONFIRMED: ["PREPARING", "CANCELLED"], PREPARING: ["READY", "CANCELLED"], READY: ["OUT_FOR_DELIVERY", "COMPLETED"], OUT_FOR_DELIVERY: ["DELIVERED"], DELIVERED: ["COMPLETED"], COMPLETED: [], CANCELLED: [] };
async function transition(id, status, actor) {
    const order = await database_1.prisma.order.findUnique({ where: { id } });
    if (!order)
        throw new http_1.AppError(404, "Order not found", "NOT_FOUND");
    if (!transitions[order.status].includes(status))
        throw new http_1.AppError(422, "Invalid order status transition", "INVALID_STATUS_TRANSITION");
    if (actor.role === "KITCHEN_STAFF" && !["PREPARING", "READY"].includes(status))
        throw new http_1.AppError(403, "Kitchen staff cannot make that transition", "FORBIDDEN");
    if (actor.role === "RIDER" && (order.riderId !== actor.userId || !["OUT_FOR_DELIVERY", "DELIVERED"].includes(status)))
        throw new http_1.AppError(403, "Rider cannot make that transition", "FORBIDDEN");
    const fields = { status };
    const now = new Date();
    if (status === "CONFIRMED")
        fields.confirmedAt = now;
    if (status === "PREPARING")
        fields.preparingAt = now;
    if (status === "READY")
        fields.readyAt = now;
    if (status === "OUT_FOR_DELIVERY")
        fields.outForDeliveryAt = now;
    if (status === "DELIVERED")
        fields.deliveredAt = now;
    if (status === "CANCELLED")
        fields.cancelledAt = now;
    return database_1.prisma.order.update({ where: { id }, data: fields });
}
async function cancel(id, userId) { const order = await database_1.prisma.order.findUnique({ where: { id } }); if (!order || order.userId !== userId)
    throw new http_1.AppError(404, "Order not found", "NOT_FOUND"); if (!["PENDING", "CONFIRMED"].includes(order.status))
    throw new http_1.AppError(422, "This order can no longer be cancelled", "CANNOT_CANCEL"); return (0, serialization_1.serialize)(await transition(id, "CANCELLED", { userId, role: "CUSTOMER" })); }
//# sourceMappingURL=orders.service.js.map