"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.list = void 0;
exports.create = create;
exports.update = update;
exports.remove = remove;
const database_1 = require("../../config/database");
const http_1 = require("../../lib/http");
const phone_1 = require("../../lib/phone");
const list = (userId) => database_1.prisma.address.findMany({ where: { userId }, orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] });
exports.list = list;
async function create(userId, input) {
    return database_1.prisma.$transaction(async (tx) => {
        if (input.isDefault)
            await tx.address.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
        return tx.address.create({ data: { ...input, phone: (0, phone_1.normalizeRwandaPhone)(input.phone), userId, isDefault: input.isDefault ?? (await tx.address.count({ where: { userId } })) === 0 } });
    });
}
async function update(userId, id, input) {
    const owned = await database_1.prisma.address.findFirst({ where: { id, userId } });
    if (!owned)
        throw new http_1.AppError(404, "Address not found", "NOT_FOUND");
    return database_1.prisma.$transaction(async (tx) => {
        if (input.isDefault)
            await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
        return tx.address.update({ where: { id: owned.id }, data: { ...input, ...(input.phone ? { phone: (0, phone_1.normalizeRwandaPhone)(input.phone) } : {}) } });
    });
}
async function remove(userId, id) {
    const result = await database_1.prisma.address.deleteMany({ where: { id, userId } });
    if (!result.count)
        throw new http_1.AppError(404, "Address not found", "NOT_FOUND");
}
//# sourceMappingURL=addresses.service.js.map