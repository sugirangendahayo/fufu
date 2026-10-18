import { Router } from "express";
import * as controller from "./categories.controller";
export const categoriesRouter = Router();
categoriesRouter.get("/", controller.list);
categoriesRouter.get("/:id", controller.get);
