import type { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../../lib/http";
import * as service from "./kitchen.service";
const statusSchema = z.object({ status: z.enum(["PREPARING", "READY"]) });
export const listOrders = asyncHandler(async (_req: Request, res: Response) => res.json({ data: await service.listOrders() }));
export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => res.json({ data: await service.updateOrderStatus(String(req.params.id), statusSchema.parse(req.body).status, req.auth!) }));
