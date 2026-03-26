import { FastifyRequest, FastifyReply } from "fastify";
import {
  CreatePaymentOrderSchema,
  VerifyPaymentSchema,
  RefundSchema,
} from "./payments.schema";
import * as PaymentsService from "./payments.service";

// ── POST /api/payments/create-order ──────────────────────────
export async function createPaymentOrderHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const parsed = CreatePaymentOrderSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply
      .status(400)
      .send({ error: parsed.error.flatten().fieldErrors });
  }

  const { userId } = (request as any).user;
  try {
    const result = await PaymentsService.createPaymentOrder(
      userId,
      parsed.data,
    );
    return reply.status(201).send(result);
  } catch (err: any) {
    request.log.error(err);
    return reply
      .status(err.statusCode ?? 500)
      .send({ error: err.message ?? "Failed to create payment order" });
  }
}

// ── POST /api/payments/verify ─────────────────────────────────
export async function verifyPaymentHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const parsed = VerifyPaymentSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply
      .status(400)
      .send({ error: parsed.error.flatten().fieldErrors });
  }

  const { userId } = (request as any).user;
  try {
    const result = await PaymentsService.verifyPayment(userId, parsed.data);
    return reply.status(200).send(result);
  } catch (err: any) {
    request.log.error(err);
    return reply
      .status(err.statusCode ?? 500)
      .send({ error: err.message ?? "Payment verification failed" });
  }
}

// ── POST /api/payments/webhook ────────────────────────────────
// No auth — Razorpay calls this directly
// Raw body needed for signature verification — must be registered with rawBody: true
export async function webhookHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const signature = request.headers["x-razorpay-signature"] as string;

  if (!signature) {
    return reply
      .status(400)
      .send({ error: "Missing Razorpay signature header" });
  }

  // rawBody is available because we register the route with { config: { rawBody: true } }
  const rawBody = (request as any).rawBody as string;

  try {
    const result = await PaymentsService.handleWebhook(rawBody, signature);
    return reply.status(200).send(result);
  } catch (err: any) {
    request.log.error(err);
    return reply
      .status(err.statusCode ?? 500)
      .send({ error: err.message ?? "Webhook handling failed" });
  }
}

// ── POST /api/payments/refund ─────────────────────────────────
export async function refundPaymentHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const parsed = RefundSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply
      .status(400)
      .send({ error: parsed.error.flatten().fieldErrors });
  }

  const { userId } = (request as any).user;
  try {
    const result = await PaymentsService.refundPayment(userId, parsed.data);
    return reply.status(200).send(result);
  } catch (err: any) {
    request.log.error(err);
    return reply
      .status(err.statusCode ?? 500)
      .send({ error: err.message ?? "Refund failed" });
  }
}
