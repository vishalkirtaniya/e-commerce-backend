import { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/auth";
import {
  createPaymentOrderHandler,
  verifyPaymentHandler,
  webhookHandler,
  refundPaymentHandler,
} from "./payments.controller";

export async function paymentRoutes(fastify: FastifyInstance) {
  const auth = { preHandler: [authenticate] };

  // POST /api/payments/create-order  — create Razorpay order, returns key_id + rz_order_id
  fastify.post("/create-order", auth, createPaymentOrderHandler);

  // POST /api/payments/verify        — verify signature after frontend checkout success
  fastify.post("/verify", auth, verifyPaymentHandler);

  // POST /api/payments/refund        — initiate full or partial refund
  fastify.post("/refund", auth, refundPaymentHandler);

  // POST /api/payments/webhook       — Razorpay server-to-server (no auth, raw body)
  fastify.post(
    "/webhook",
    {
      config: { rawBody: true }, // needed for HMAC signature verification
    },
    webhookHandler,
  );
}
