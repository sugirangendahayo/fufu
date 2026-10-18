import { Router } from "express";
import { allow, authenticate } from "../../middleware/auth";
import * as controller from "./kitchen.controller";
export const kitchenRouter = Router();
kitchenRouter.use(authenticate, allow("KITCHEN_STAFF", "ADMIN"));
kitchenRouter.get("/orders", controller.listOrders);
kitchenRouter.patch("/orders/:id/status", controller.updateOrderStatus);
