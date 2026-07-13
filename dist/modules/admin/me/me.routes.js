"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = meRoutes;
const verifyAdminJWT_js_1 = require("../middleware/verifyAdminJWT.js");
const me_controller_js_1 = require("./me.controller.js");
async function meRoutes(fastify) {
    fastify.get('/me', {
        preHandler: [verifyAdminJWT_js_1.verifyAdminJWT],
    }, me_controller_js_1.getMeHandler);
}
//# sourceMappingURL=me.routes.js.map