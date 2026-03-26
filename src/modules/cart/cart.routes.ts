import { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/auth";
import {
  getCartHandler,
  addToCartHandler,
  updateCartItemHandler,
  removeCartItemHandler,
  clearCartHandler,
  applyPromoHandler,
  removePromoHandler,
} from "./cart.controller";

export async function cartRoutes(fastify: FastifyInstance) {
  const auth = { preHandler: [authenticate] };

  // GET    /api/cart
  fastify.get("/", auth, getCartHandler);

  // POST   /api/cart
  fastify.post("/", auth, addToCartHandler);

  // DELETE /api/cart
  fastify.delete("/", auth, clearCartHandler);

  // PATCH  /api/cart/:itemId
  fastify.patch<{ Params: { itemId: string } }>(
    "/:itemId",
    auth,
    updateCartItemHandler,
  );

  // DELETE /api/cart/:itemId
  fastify.delete<{ Params: { itemId: string } }>(
    "/:itemId",
    auth,
    removeCartItemHandler,
  );

  // POST   /api/cart/promo
  fastify.post("/promo", auth, applyPromoHandler);

  // DELETE /api/cart/promo
  fastify.delete("/promo", auth, removePromoHandler);
}
