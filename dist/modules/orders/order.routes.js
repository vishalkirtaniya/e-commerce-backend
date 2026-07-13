"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRoutes = orderRoutes;
const auth_1 = require("../../middleware/auth");
const orders_controller_1 = require("./orders.controller");
async function orderRoutes(fastify) {
    const auth = { preHandler: [auth_1.authenticate] };
    // GET  /api/orders                  — list all orders for user
    fastify.get("/", auth, orders_controller_1.getOrdersHandler);
    // POST /api/orders                  — place order from cart
    fastify.post("/", auth, orders_controller_1.placeOrderHandler);
    // GET  /api/orders/:orderNumber     — single order detail + progress tracker
    fastify.get("/:orderNumber", auth, orders_controller_1.getOrderByIdHandler);
}
//# sourceMappingURL=order.routes.js.map