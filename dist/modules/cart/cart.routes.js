"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = cartRoutes;
const cart_controller_1 = require("./cart.controller");
const auth_1 = require("../../middleware/auth");
async function cartRoutes(app) {
    app.post("/cart/add", { preHandler: auth_1.authMiddleware }, cart_controller_1.addToCart);
    app.get("/cart", { preHandler: auth_1.authMiddleware }, cart_controller_1.getCart);
    app.delete("/cart/item/:id", { preHandler: auth_1.authMiddleware }, cart_controller_1.deleteCartItem);
}
