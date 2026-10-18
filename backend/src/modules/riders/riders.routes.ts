import { Router } from "express";
import { allow, authenticate } from "../../middleware/auth";
import * as controller from "./riders.controller";
export const ridersRouter = Router();
ridersRouter.use(authenticate, allow("RIDER"));
ridersRouter.get("/orders", controller.listOrders);
ridersRouter.patch("/orders/:id/status", controller.updateOrderStatus);
