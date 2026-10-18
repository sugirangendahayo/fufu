import type { Request, Response } from "express";
import { asyncHandler } from "../../lib/http";
import { initializePaymentSchema, webhookBodySchema } from "./payments.schema";
import * as service from "./payments.service";
export const get = asyncHandler(async (req: Request, res: Response) => res.json({ data: await service.get(String(req.params.id), req.auth!) }));
export const initialize = asyncHandler(async (req: Request, res: Response) => { const data = await service.initialize(initializePaymentSchema.parse(req.body).orderId, req.auth!.userId); res.status(501).json({ error: { code: "PAYMENT_INITIALIZATION_PENDING", message: "Configure Flutterwave API verification before enabling online payments" }, data }); });
export const flutterwaveWebhook = asyncHandler(async (req: Request, res: Response) => { const data = await service.webhook(req.header("verif-hash"), webhookBodySchema.parse(req.body)); res.status(data.duplicate ? 200 : 202).json({ data }); });
