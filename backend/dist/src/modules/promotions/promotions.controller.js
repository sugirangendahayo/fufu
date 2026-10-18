"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = void 0;
const http_1 = require("../../lib/http");
const promotions_schema_1 = require("./promotions.schema");
const promotions_service_1 = require("./promotions.service");
exports.create = (0, http_1.asyncHandler)(async (req, res) => res.status(201).json({ data: await (0, promotions_service_1.create)(promotions_schema_1.promotionSchema.parse(req.body)) }));
//# sourceMappingURL=promotions.controller.js.map