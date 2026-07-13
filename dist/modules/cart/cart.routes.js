"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartRoutes = cartRoutes;
const auth_1 = require("../../middleware/auth");
const cart_controller_1 = require("./cart.controller");
async function cartRoutes(fastify) {
    const auth = { preHandler: [auth_1.authenticate] };
    // GET    /api/cart
    fastify.get("/", auth, cart_controller_1.getCartHandler);
    // POST   /api/cart
    fastify.post("/", auth, cart_controller_1.addToCartHandler);
    // DELETE /api/cart
    fastify.delete("/", auth, cart_controller_1.clearCartHandler);
    // PATCH  /api/cart/:itemId
    fastify.patch("/:itemId", auth, cart_controller_1.updateCartItemHandler);
    // DELETE /api/cart/:itemId
    fastify.delete("/:itemId", auth, cart_controller_1.removeCartItemHandler);
    // POST   /api/cart/promo
    fastify.post("/promo", auth, cart_controller_1.applyPromoHandler);
    // DELETE /api/cart/promo
    fastify.delete("/promo", auth, cart_controller_1.removePromoHandler);
}
//# sourceMappingURL=cart.routes.js.map