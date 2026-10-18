import type { Request, Response } from "express";
import { asyncHandler } from "../../lib/http";
import { addCartItemSchema, updateCartItemSchema } from "./cart.schema";
import * as service from "./cart.service";
export const show = asyncHandler(async (req: Request, res: Response) => res.json({ data: await service.show(req.auth!.userId) }));
export const add = asyncHandler(async (req: Request, res: Response) => res.status(201).json({ data: await service.add(req.auth!.userId, addCartItemSchema.parse(req.body)) }));
export const update = asyncHandler(async (req: Request, res: Response) => res.json({ data: await service.update(req.auth!.userId, String(req.params.itemId), updateCartItemSchema.parse(req.body)) }));
export const remove = asyncHandler(async (req: Request, res: Response) => { await service.remove(req.auth!.userId, String(req.params.itemId)); res.status(204).end(); });
export const clear = asyncHandler(async (req: Request, res: Response) => { await service.clear(req.auth!.userId); res.status(204).end(); });
