import type { Request, Response } from "express";
import { asyncHandler } from "../../lib/http";
import { promotionSchema } from "./promotions.schema";
import { create as createPromotion } from "./promotions.service";
export const create = asyncHandler(async (req: Request, res: Response) => res.status(201).json({ data: await createPromotion(promotionSchema.parse(req.body)) }));
