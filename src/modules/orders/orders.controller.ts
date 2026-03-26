import { FastifyRequest, FastifyReply } from "fastify";
import { PlaceOrderSchema } from "./orders.schema";
import * as OrdersService from "./orders.service";

// ── GET /api/orders ───────────────────────────────────────────
export async function getOrdersHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { userId } = (request as any).user;
  try {
    const orders = await OrdersService.getOrders(userId);
    return reply.status(200).send({ data: orders });
  } catch (err) {
    request.log.error(err);
    return reply.status(500).send({ error: "Failed to fetch orders" });
  }
}

// ── GET /api/orders/:orderNumber ──────────────────────────────
export async function getOrderByIdHandler(
  request: FastifyRequest<{ Params: { orderNumber: string } }>,
  reply: FastifyReply,
) {
  const { userId } = (request as any).user;
  const { orderNumber } = request.params;

  try {
    const order = await OrdersService.getOrderById(userId, orderNumber);
    if (!order) {
      return reply
        .status(404)
        .send({ error: `Order '${orderNumber}' not found` });
    }
    return reply.status(200).send(order);
  } catch (err) {
    request.log.error(err);
    return reply.status(500).send({ error: "Failed to fetch order" });
  }
}

// ── POST /api/orders ──────────────────────────────────────────
export async function placeOrderHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const parsed = PlaceOrderSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply
      .status(400)
      .send({ error: parsed.error.flatten().fieldErrors });
  }

  const { userId } = (request as any).user;
  try {
    const result = await OrdersService.placeOrder(userId, parsed.data);
    return reply.status(201).send(result);
  } catch (err: any) {
    request.log.error(err);
    return reply
      .status(err.statusCode ?? 500)
      .send({ error: err.message ?? "Failed to place order" });
  }
}
