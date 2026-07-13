"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRoutes = paymentRoutes;
const auth_1 = require("../../middleware/auth");
const payments_controller_1 = require("./payments.controller");
async function paymentRoutes(fastify) {
    const auth = { preHandler: [auth_1.authenticate] };
    // POST /api/payments/create-order  — create Razorpay order, returns key_id + rz_order_id
    fastify.post("/create-order", auth, payments_controller_1.createPaymentOrderHandler);
    // POST /api/payments/verify        — verify signature after frontend checkout success
    fastify.post("/verify", auth, payments_controller_1.verifyPaymentHandler);
    // POST /api/payments/refund        — initiate full or partial refund
    fastify.post("/refund", auth, payments_controller_1.refundPaymentHandler);
    // POST /api/payments/webhook       — Razorpay server-to-server (no auth, raw body)
    fastify.post("/webhook", {
        config: { rawBody: true }, // needed for HMAC signature verification
    }, payments_controller_1.webhookHandler);
}
//# sourceMappingURL=payments.routes.js.map