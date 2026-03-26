import { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/auth";
import {
  getOrdersHandler,
  getOrderByIdHandler,
  placeOrderHandler,
} from "./orders.controller";

export async function orderRoutes(fastify: FastifyInstance) {
  const auth = { preHandler: [authenticate] };

  // GET  /api/orders                  — list all orders for user
  fastify.get("/", auth, getOrdersHandler);

  // POST /api/orders                  — place order from cart
  fastify.post("/", auth, placeOrderHandler);

  // GET  /api/orders/:orderNumber     — single order detail + progress tracker
  fastify.get<{ Params: { orderNumber: string } }>(
    "/:orderNumber",
    auth,
    getOrderByIdHandler,
  );
}
