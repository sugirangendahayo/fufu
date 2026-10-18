"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = create;
const client_1 = require("../../../generated/prisma/client");
const database_1 = require("../../config/database");
const serialization_1 = require("../../lib/serialization");
async function create(input) { const decimal = (value) => new client_1.Prisma.Decimal(value); return (0, serialization_1.serialize)(await database_1.prisma.promotion.create({ data: { ...input, value: decimal(input.value), minimumOrderValue: input.minimumOrderValue === undefined ? undefined : decimal(input.minimumOrderValue), maximumDiscount: input.maximumDiscount === undefined ? undefined : decimal(input.maximumDiscount) } })); }
//# sourceMappingURL=promotions.service.js.map