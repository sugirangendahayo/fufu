import { Router } from "express";
import { allow, authenticate } from "../../middleware/auth";
import { create } from "./promotions.controller";
export const promotionsRouter = Router();
promotionsRouter.use(authenticate, allow("ADMIN"));
promotionsRouter.post("/", create);
