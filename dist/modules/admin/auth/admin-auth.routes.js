"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = adminAuthRoutes;
const admin_auth_controller_js_1 = require("./admin-auth.controller.js");
async function adminAuthRoutes(fastify) {
    // POST /admin/login — no JWT guard, this is the login endpoint
    fastify.post("/login", {}, admin_auth_controller_js_1.adminLoginHandler);
}
//# sourceMappingURL=admin-auth.routes.js.map