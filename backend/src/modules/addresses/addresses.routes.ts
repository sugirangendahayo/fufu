import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import * as controller from "./addresses.controller";
export const addressesRouter = Router();
addressesRouter.use(authenticate);
addressesRouter.get("/", controller.list);
addressesRouter.post("/", controller.create);
addressesRouter.patch("/:id", controller.update);
addressesRouter.delete("/:id", controller.remove);
