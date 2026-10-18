"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serialize = void 0;
const client_1 = require("../../generated/prisma/client");
/** Converts Prisma Decimal values at the HTTP boundary without changing service values. */
const serialize = (value) => JSON.parse(JSON.stringify(value, (_key, item) => item instanceof client_1.Prisma.Decimal ? item.toString() : item));
exports.serialize = serialize;
//# sourceMappingURL=serialization.js.map