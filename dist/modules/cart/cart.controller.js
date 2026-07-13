"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCartHandler = getCartHandler;
exports.addToCartHandler = addToCartHandler;
exports.updateCartItemHandler = updateCartItemHandler;
exports.removeCartItemHandler = removeCartItemHandler;
exports.clearCartHandler = clearCartHandler;
exports.applyPromoHandler = applyPromoHandler;
exports.removePromoHandler = removePromoHandler;
const cart_schema_1 = require("./cart.schema");
const CartService = __importStar(require("./cart.service"));
// ── GET /api/cart ─────────────────────────────────────────────
async function getCartHandler(request, reply) {
    const { userId } = request.user;
    try {
        const cart = await CartService.getCart(userId);
        return reply.status(200).send(cart);
    }
    catch (err) {
        request.log.error(err);
        return reply.status(500).send({ error: "Failed to fetch cart" });
    }
}
// ── POST /api/cart ────────────────────────────────────────────
async function addToCartHandler(request, reply) {
    const parsed = cart_schema_1.AddToCartSchema.safeParse(request.body);
    if (!parsed.success) {
        return reply
            .status(400)
            .send({ error: parsed.error.flatten().fieldErrors });
    }
    const { userId } = request.user;
    try {
        const item = await CartService.addToCart(userId, parsed.data);
        return reply.status(201).send(item);
    }
    catch (err) {
        request.log.error(err);
        return reply
            .status(err.statusCode ?? 500)
            .send({ error: err.message ?? "Failed to add to cart" });
    }
}
// ── PATCH /api/cart/:itemId ───────────────────────────────────
async function updateCartItemHandler(request, reply) {
    const parsed = cart_schema_1.UpdateCartItemSchema.safeParse(request.body);
    if (!parsed.success) {
        return reply
            .status(400)
            .send({ error: parsed.error.flatten().fieldErrors });
    }
    const { userId } = request.user;
    const itemId = parseInt(request.params.itemId, 10);
    if (isNaN(itemId)) {
        return reply.status(400).send({ error: "Invalid item ID" });
    }
    try {
        const item = await CartService.updateCartItem(userId, itemId, parsed.data);
        return reply.status(200).send(item);
    }
    catch (err) {
        request.log.error(err);
        return reply
            .status(err.statusCode ?? 500)
            .send({ error: err.message ?? "Failed to update cart item" });
    }
}
// ── DELETE /api/cart/:itemId ──────────────────────────────────
async function removeCartItemHandler(request, reply) {
    const { userId } = request.user;
    const itemId = parseInt(request.params.itemId, 10);
    if (isNaN(itemId)) {
        return reply.status(400).send({ error: "Invalid item ID" });
    }
    try {
        const result = await CartService.removeCartItem(userId, itemId);
        return reply.status(200).send(result);
    }
    catch (err) {
        request.log.error(err);
        return reply
            .status(err.statusCode ?? 500)
            .send({ error: err.message ?? "Failed to remove cart item" });
    }
}
// ── DELETE /api/cart ──────────────────────────────────────────
async function clearCartHandler(request, reply) {
    const { userId } = request.user;
    try {
        const result = await CartService.clearCart(userId);
        return reply.status(200).send(result);
    }
    catch (err) {
        request.log.error(err);
        return reply.status(500).send({ error: "Failed to clear cart" });
    }
}
// ── POST /api/cart/promo ──────────────────────────────────────
async function applyPromoHandler(request, reply) {
    const parsed = cart_schema_1.ApplyPromoSchema.safeParse(request.body);
    if (!parsed.success) {
        return reply
            .status(400)
            .send({ error: parsed.error.flatten().fieldErrors });
    }
    const { userId } = request.user;
    try {
        const result = await CartService.applyPromo(userId, parsed.data);
        return reply.status(200).send(result);
    }
    catch (err) {
        request.log.error(err);
        return reply
            .status(err.statusCode ?? 500)
            .send({ error: err.message ?? "Failed to apply promo code" });
    }
}
// ── DELETE /api/cart/promo ────────────────────────────────────
async function removePromoHandler(request, reply) {
    const { userId } = request.user;
    try {
        const result = await CartService.removePromo(userId);
        return reply.status(200).send(result);
    }
    catch (err) {
        request.log.error(err);
        return reply.status(500).send({ error: "Failed to remove promo code" });
    }
}
//# sourceMappingURL=cart.controller.js.map