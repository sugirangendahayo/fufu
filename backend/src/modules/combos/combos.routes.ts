import { Router } from "express";
import { list } from "./combos.controller";
export const combosRouter = Router();
combosRouter.get("/", list);
