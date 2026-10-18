import type { Request, Response } from "express";
import { asyncHandler } from "../../lib/http";
import { checkoutSchema, orderListQuerySchema } from "./orders.schema";
import * as service from "./orders.service";
export const checkout = asyncHandler(async (req: Request, res: Response) => res.status(201).json({ data: await service.checkout(req.auth!.userId, checkoutSchema.parse(req.body)) }));
export const list = asyncHandler(async (req: Request, res: Response) => res.json(await service.list(req.auth!.userId, req.auth!.role, orderListQuerySchema.parse(req.query))));
export const get = asyncHandler(async (req: Request, res: Response) => res.json({ data: await service.get(String(req.params.id), req.auth!) }));
export const cancel = asyncHandler(async (req: Request, res: Response) => res.json({ data: await service.cancel(String(req.params.id), req.auth!.userId) }));
