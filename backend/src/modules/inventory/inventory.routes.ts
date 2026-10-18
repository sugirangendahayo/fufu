import { Router } from "express";
import { allow, authenticate } from "../../middleware/auth";
import * as controller from "./inventory.controller";
export const inventoryRouter = Router();
inventoryRouter.use(authenticate, allow("ADMIN"));
inventoryRouter.patch("/products/:id/inventory", controller.update);
inventoryRouter.get("/inventory/low-stock", controller.lowStock);
