"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.promotionsRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const promotions_controller_1 = require("./promotions.controller");
exports.promotionsRouter = (0, express_1.Router)();
exports.promotionsRouter.use(auth_1.authenticate, (0, auth_1.allow)("ADMIN"));
exports.promotionsRouter.post("/", promotions_controller_1.create);
//# sourceMappingURL=promotions.routes.js.map