"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = orderRoutes;
const verifyAdminJWT_js_1 = require("../middleware/verifyAdminJWT.js");
const requirePermission_js_1 = require("../middleware/requirePermission.js");
const orders_controller_js_1 = require("./orders.controller.js");
async function orderRoutes(fastify) {
    fastify.get("/orders", {
        preHandler: [verifyAdminJWT_js_1.verifyAdminJWT, (0, requirePermission_js_1.requirePermission)("orders:read")],
    }, orders_controller_js_1.getOrdersHandler);
    fastify.patch("/orders/:id/status", {
        preHandler: [verifyAdminJWT_js_1.verifyAdminJWT, (0, requirePermission_js_1.requirePermission)("orders:write")],
    }, orders_controller_js_1.updateOrderStatusHandler);
    fastify.post("/orders/:id/refund", {
        preHandler: [verifyAdminJWT_js_1.verifyAdminJWT, (0, requirePermission_js_1.requirePermission)("orders:refund")],
    }, orders_controller_js_1.refundOrderHandler);
}
//# sourceMappingURL=orders.routes.js.map