"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.combosRouter = void 0;
const express_1 = require("express");
const combos_controller_1 = require("./combos.controller");
exports.combosRouter = (0, express_1.Router)();
exports.combosRouter.get("/", combos_controller_1.list);
//# sourceMappingURL=combos.routes.js.map