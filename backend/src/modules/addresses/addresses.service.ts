import { prisma } from "../../config/database";
import { AppError } from "../../lib/http";
import { normalizeRwandaPhone } from "../../lib/phone";
import type { AddressBody, PartialAddressBody } from "./addresses.schema";

export const list = (userId: string) => prisma.address.findMany({ where: { userId }, orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] });
export async function create(userId: string, input: AddressBody) {
  return prisma.$transaction(async (tx) => {
    if (input.isDefault) await tx.address.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
    return tx.address.create({ data: { ...input, phone: normalizeRwandaPhone(input.phone), userId, isDefault: input.isDefault ?? (await tx.address.count({ where: { userId } })) === 0 } });
  });
}
export async function update(userId: string, id: string, input: PartialAddressBody) {
  const owned = await prisma.address.findFirst({ where: { id, userId } });
  if (!owned) throw new AppError(404, "Address not found", "NOT_FOUND");
  return prisma.$transaction(async (tx) => {
    if (input.isDefault) await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
    return tx.address.update({ where: { id: owned.id }, data: { ...input, ...(input.phone ? { phone: normalizeRwandaPhone(input.phone) } : {}) } });
  });
}
export async function remove(userId: string, id: string) {
  const result = await prisma.address.deleteMany({ where: { id, userId } });
  if (!result.count) throw new AppError(404, "Address not found", "NOT_FOUND");
}
