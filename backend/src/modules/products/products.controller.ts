import type { Request, Response } from "express";
import { asyncHandler } from "../../lib/http";
import { productListQuerySchema } from "./products.schema";
import * as service from "./products.service";
export const list = asyncHandler(async (req: Request, res: Response) => res.json(await service.list(productListQuerySchema.parse(req.query))));
export const get = asyncHandler(async (req: Request, res: Response) => res.json({ data: await service.get(String(req.params.id)) }));
