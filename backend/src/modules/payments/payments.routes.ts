import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import * as controller from "./payments.controller";
export const paymentsRouter = Router();
paymentsRouter.post("/flutterwave/webhook", controller.flutterwaveWebhook);
paymentsRouter.use(authenticate);
paymentsRouter.get("/:id", controller.get);
paymentsRouter.post("/initialize", controller.initialize);
