import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import * as controller from "./auth.controller";

export const authRouter = Router();
authRouter.post("/register", controller.register);
authRouter.post("/login", controller.login);
authRouter.post("/refresh", controller.refresh);
authRouter.post("/logout", controller.logout);
authRouter.get("/me", authenticate, controller.me);
authRouter.patch("/me", authenticate, controller.updateProfile);
authRouter.post("/change-password", authenticate, controller.changePassword);
