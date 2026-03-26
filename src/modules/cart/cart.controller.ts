import { FastifyRequest, FastifyReply } from "fastify";
import {
  AddToCartSchema,
  UpdateCartItemSchema,
  ApplyPromoSchema,
} from "./cart.schema";
import * as CartService from "./cart.service";

// ── GET /api/cart ─────────────────────────────────────────────
export async function getCartHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { userId } = (request as any).user;
  try {
    const cart = await CartService.getCart(userId);
    return reply.status(200).send(cart);
  } catch (err: any) {
    request.log.error(err);
    return reply.status(500).send({ error: "Failed to fetch cart" });
  }
}

// ── POST /api/cart ────────────────────────────────────────────
export async function addToCartHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const parsed = AddToCartSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply
      .status(400)
      .send({ error: parsed.error.flatten().fieldErrors });
  }

  const { userId } = (request as any).user;
  try {
    const item = await CartService.addToCart(userId, parsed.data);
    return reply.status(201).send(item);
  } catch (err: any) {
    request.log.error(err);
    return reply
      .status(err.statusCode ?? 500)
      .send({ error: err.message ?? "Failed to add to cart" });
  }
}

// ── PATCH /api/cart/:itemId ───────────────────────────────────
export async function updateCartItemHandler(
  request: FastifyRequest<{ Params: { itemId: string } }>,
  reply: FastifyReply,
) {
  const parsed = UpdateCartItemSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply
      .status(400)
      .send({ error: parsed.error.flatten().fieldErrors });
  }

  const { userId } = (request as any).user;
  const itemId = parseInt(request.params.itemId, 10);

  if (isNaN(itemId)) {
    return reply.status(400).send({ error: "Invalid item ID" });
  }

  try {
    const item = await CartService.updateCartItem(userId, itemId, parsed.data);
    return reply.status(200).send(item);
  } catch (err: any) {
    request.log.error(err);
    return reply
      .status(err.statusCode ?? 500)
      .send({ error: err.message ?? "Failed to update cart item" });
  }
}

// ── DELETE /api/cart/:itemId ──────────────────────────────────
export async function removeCartItemHandler(
  request: FastifyRequest<{ Params: { itemId: string } }>,
  reply: FastifyReply,
) {
  const { userId } = (request as any).user;
  const itemId = parseInt(request.params.itemId, 10);

  if (isNaN(itemId)) {
    return reply.status(400).send({ error: "Invalid item ID" });
  }

  try {
    const result = await CartService.removeCartItem(userId, itemId);
    return reply.status(200).send(result);
  } catch (err: any) {
    request.log.error(err);
    return reply
      .status(err.statusCode ?? 500)
      .send({ error: err.message ?? "Failed to remove cart item" });
  }
}

// ── DELETE /api/cart ──────────────────────────────────────────
export async function clearCartHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { userId } = (request as any).user;
  try {
    const result = await CartService.clearCart(userId);
    return reply.status(200).send(result);
  } catch (err: any) {
    request.log.error(err);
    return reply.status(500).send({ error: "Failed to clear cart" });
  }
}

// ── POST /api/cart/promo ──────────────────────────────────────
export async function applyPromoHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const parsed = ApplyPromoSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply
      .status(400)
      .send({ error: parsed.error.flatten().fieldErrors });
  }

  const { userId } = (request as any).user;
  try {
    const result = await CartService.applyPromo(userId, parsed.data);
    return reply.status(200).send(result);
  } catch (err: any) {
    request.log.error(err);
    return reply
      .status(err.statusCode ?? 500)
      .send({ error: err.message ?? "Failed to apply promo code" });
  }
}

// ── DELETE /api/cart/promo ────────────────────────────────────
export async function removePromoHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { userId } = (request as any).user;
  try {
    const result = await CartService.removePromo(userId);
    return reply.status(200).send(result);
  } catch (err: any) {
    request.log.error(err);
    return reply.status(500).send({ error: "Failed to remove promo code" });
  }
}
