"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addToCart = addToCart;
exports.getCart = getCart;
exports.deleteCartItem = deleteCartItem;
const cart_service_1 = require("./cart.service");
async function addToCart(req, reply) {
    const userId = req.userId;
    const { productId, quantity } = req.body;
    const item = await (0, cart_service_1.addCartItem)(userId, productId, quantity);
    return item;
}
async function getCart(req) {
    const userId = req.userId;
    const items = await (0, cart_service_1.getUserCart)(userId);
    return items;
}
async function deleteCartItem(req) {
    const { id } = req.params;
    await (0, cart_service_1.removeCartItem)(id);
    return { message: "Item removed" };
}
