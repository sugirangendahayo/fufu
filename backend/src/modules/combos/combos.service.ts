import { prisma } from "../../config/database";
import { serialize } from "../../lib/serialization";
export const list = async () => serialize(await prisma.combo.findMany({ where: { isActive: true }, include: { items: { include: { product: true } } } }));
