import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import * as controller from "./orders.controller";
export const ordersRouter = Router();
ordersRouter.use(authenticate);
ordersRouter.post("/", controller.checkout);
ordersRouter.get("/", controller.list);
ordersRouter.get("/:id", controller.get);
ordersRouter.post("/:id/cancel", controller.cancel);
