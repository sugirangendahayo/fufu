import { prisma } from "../../config/database";
import { env } from "../../config/env";
import { AppError } from "../../lib/http";
import { hashToken, randomRef } from "../../lib/security";
import { serialize } from "../../lib/serialization";
import type { UserRole } from "../../../generated/prisma/client";
import type { WebhookBody } from "./payments.schema";

export async function get(id: string, actor: { userId: string; role: UserRole }) {
  const payment = await prisma.payment.findUnique({ where: { id }, include: { order: true } });
  if (!payment || (actor.role === "CUSTOMER" && payment.order.userId !== actor.userId)) throw new AppError(404, "Payment not found", "NOT_FOUND"); return serialize(payment);
}
export async function initialize(orderId: string, userId: string) {
  const payment = await prisma.payment.findFirst({ where: { orderId }, include: { order: true } });
  if (!payment || payment.order.userId !== userId) throw new AppError(404, "Payment not found", "NOT_FOUND");
  if (!(["FLUTTERWAVE", "MOMO", "CARD"] as string[]).includes(payment.method)) throw new AppError(422, "This payment method does not require online initialization", "INVALID_PAYMENT_METHOD");
  if (!env.FLUTTERWAVE_SECRET_KEY) throw new AppError(503, "Online payments are not configured", "PAYMENT_PROVIDER_UNAVAILABLE");
  const reference = `fufu_${payment.order.orderNumber}_${randomRef()}`; await prisma.payment.update({ where: { id: payment.id }, data: { status: "PROCESSING", transactionRef: reference } }); return { paymentId: payment.id, reference };
}
export async function webhook(signature: string | undefined, body: WebhookBody) {
  if (!env.FLUTTERWAVE_WEBHOOK_SECRET || signature !== env.FLUTTERWAVE_WEBHOOK_SECRET) throw new AppError(401, "Invalid webhook signature", "INVALID_WEBHOOK_SIGNATURE");
  const event = await prisma.paymentWebhookEvent.create({ data: { provider: "FLUTTERWAVE", eventId: String(body.id), payloadHash: hashToken(JSON.stringify(body)) } }).catch((error: unknown) => { if ((error as { code?: string }).code === "P2002") return null; throw error; });
  return event ? { received: true, verified: false } : { received: true, duplicate: true };
}
