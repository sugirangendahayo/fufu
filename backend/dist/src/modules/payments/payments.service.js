"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.get = get;
exports.initialize = initialize;
exports.webhook = webhook;
const database_1 = require("../../config/database");
const env_1 = require("../../config/env");
const http_1 = require("../../lib/http");
const security_1 = require("../../lib/security");
const serialization_1 = require("../../lib/serialization");
async function get(id, actor) {
    const payment = await database_1.prisma.payment.findUnique({ where: { id }, include: { order: true } });
    if (!payment || (actor.role === "CUSTOMER" && payment.order.userId !== actor.userId))
        throw new http_1.AppError(404, "Payment not found", "NOT_FOUND");
    return (0, serialization_1.serialize)(payment);
}
async function initialize(orderId, userId) {
    const payment = await database_1.prisma.payment.findFirst({ where: { orderId }, include: { order: true } });
    if (!payment || payment.order.userId !== userId)
        throw new http_1.AppError(404, "Payment not found", "NOT_FOUND");
    if (!["FLUTTERWAVE", "MOMO", "CARD"].includes(payment.method))
        throw new http_1.AppError(422, "This payment method does not require online initialization", "INVALID_PAYMENT_METHOD");
    if (!env_1.env.FLUTTERWAVE_SECRET_KEY)
        throw new http_1.AppError(503, "Online payments are not configured", "PAYMENT_PROVIDER_UNAVAILABLE");
    const reference = `fufu_${payment.order.orderNumber}_${(0, security_1.randomRef)()}`;
    await database_1.prisma.payment.update({ where: { id: payment.id }, data: { status: "PROCESSING", transactionRef: reference } });
    return { paymentId: payment.id, reference };
}
async function webhook(signature, body) {
    if (!env_1.env.FLUTTERWAVE_WEBHOOK_SECRET || signature !== env_1.env.FLUTTERWAVE_WEBHOOK_SECRET)
        throw new http_1.AppError(401, "Invalid webhook signature", "INVALID_WEBHOOK_SIGNATURE");
    const event = await database_1.prisma.paymentWebhookEvent.create({ data: { provider: "FLUTTERWAVE", eventId: String(body.id), payloadHash: (0, security_1.hashToken)(JSON.stringify(body)) } }).catch((error) => { if (error.code === "P2002")
        return null; throw error; });
    return event ? { received: true, verified: false } : { received: true, duplicate: true };
}
//# sourceMappingURL=payments.service.js.map