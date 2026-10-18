import type { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../../lib/http";
import * as service from "./riders.service";
const statusSchema = z.object({ status: z.enum(["OUT_FOR_DELIVERY", "DELIVERED"]) });
export const listOrders = asyncHandler(async (req: Request, res: Response) => res.json({ data: await service.listOrders(req.auth!.userId) }));
export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => res.json({ data: await service.updateOrderStatus(String(req.params.id), statusSchema.parse(req.body).status, req.auth!.userId) }));
