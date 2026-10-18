import type { Request, Response } from "express";
import { asyncHandler } from "../../lib/http";
import * as service from "./categories.service";
export const list = asyncHandler(async (_req: Request, res: Response) => res.json({ data: await service.list() }));
export const get = asyncHandler(async (req: Request, res: Response) => res.json({ data: await service.get(String(req.params.id)) }));
