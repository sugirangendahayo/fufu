import type { Request, Response } from "express";
import { asyncHandler } from "../../lib/http";
import * as service from "./combos.service";
export const list = asyncHandler(async (_req: Request, res: Response) => res.json({ data: await service.list() }));
