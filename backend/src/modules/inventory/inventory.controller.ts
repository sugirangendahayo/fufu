import type { Request, Response } from "express";
import { asyncHandler } from "../../lib/http";
import { inventorySchema } from "./inventory.schema";
import * as service from "./inventory.service";
export const update = asyncHandler(async (req: Request, res: Response) => res.json({ data: await service.update(String(req.params.id), inventorySchema.parse(req.body)) }));
export const lowStock = asyncHandler(async (_req: Request, res: Response) => res.json({ data: await service.lowStock() }));
