"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const env_1 = require("./config/env");
const app_1 = require("./app");
const PORT = env_1.env.PORT;
app_1.app.listen(PORT, () => {
    console.log(`Fufu API running at http://localhost:${PORT}`);
});
//# sourceMappingURL=server.js.map