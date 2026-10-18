import type { Request, Response } from "express";
import { asyncHandler } from "../../lib/http";
import { addressBodySchema } from "./addresses.schema";
import * as service from "./addresses.service";
export const list = asyncHandler(async (req: Request, res: Response) => res.json({ data: await service.list(req.auth!.userId) }));
export const create = asyncHandler(async (req: Request, res: Response) => res.status(201).json({ data: await service.create(req.auth!.userId, addressBodySchema.parse(req.body)) }));
export const update = asyncHandler(async (req: Request, res: Response) => res.json({ data: await service.update(req.auth!.userId, String(req.params.id), addressBodySchema.partial().parse(req.body)) }));
export const remove = asyncHandler(async (req: Request, res: Response) => { await service.remove(req.auth!.userId, String(req.params.id)); res.status(204).end(); });
