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
exports.createPaymentOrderHandler = createPaymentOrderHandler;
exports.verifyPaymentHandler = verifyPaymentHandler;
exports.webhookHandler = webhookHandler;
exports.refundPaymentHandler = refundPaymentHandler;
const payments_schema_1 = require("./payments.schema");
const PaymentsService = __importStar(require("./payments.service"));
// ── POST /api/payments/create-order ──────────────────────────
async function createPaymentOrderHandler(request, reply) {
    const parsed = payments_schema_1.CreatePaymentOrderSchema.safeParse(request.body);
    if (!parsed.success) {
        return reply
            .status(400)
            .send({ error: parsed.error.flatten().fieldErrors });
    }
    const { userId } = request.user;
    try {
        const result = await PaymentsService.createPaymentOrder(userId, parsed.data);
        return reply.status(201).send(result);
    }
    catch (err) {
        request.log.error(err);
        return reply
            .status(err.statusCode ?? 500)
            .send({ error: err.message ?? "Failed to create payment order" });
    }
}
// ── POST /api/payments/verify ─────────────────────────────────
async function verifyPaymentHandler(request, reply) {
    const parsed = payments_schema_1.VerifyPaymentSchema.safeParse(request.body);
    if (!parsed.success) {
        return reply
            .status(400)
            .send({ error: parsed.error.flatten().fieldErrors });
    }
    const { userId } = request.user;
    try {
        const result = await PaymentsService.verifyPayment(userId, parsed.data);
        return reply.status(200).send(result);
    }
    catch (err) {
        request.log.error(err);
        return reply
            .status(err.statusCode ?? 500)
            .send({ error: err.message ?? "Payment verification failed" });
    }
}
// ── POST /api/payments/webhook ────────────────────────────────
// No auth — Razorpay calls this directly
// Raw body needed for signature verification — must be registered with rawBody: true
async function webhookHandler(request, reply) {
    const signature = request.headers["x-razorpay-signature"];
    if (!signature) {
        return reply
            .status(400)
            .send({ error: "Missing Razorpay signature header" });
    }
    // rawBody is available because we register the route with { config: { rawBody: true } }
    const rawBody = request.rawBody;
    try {
        const result = await PaymentsService.handleWebhook(rawBody, signature);
        return reply.status(200).send(result);
    }
    catch (err) {
        request.log.error(err);
        return reply
            .status(err.statusCode ?? 500)
            .send({ error: err.message ?? "Webhook handling failed" });
    }
}
// ── POST /api/payments/refund ─────────────────────────────────
async function refundPaymentHandler(request, reply) {
    const parsed = payments_schema_1.RefundSchema.safeParse(request.body);
    if (!parsed.success) {
        return reply
            .status(400)
            .send({ error: parsed.error.flatten().fieldErrors });
    }
    const { userId } = request.user;
    try {
        const result = await PaymentsService.refundPayment(userId, parsed.data);
        return reply.status(200).send(result);
    }
    catch (err) {
        request.log.error(err);
        return reply
            .status(err.statusCode ?? 500)
            .send({ error: err.message ?? "Refund failed" });
    }
}
//# sourceMappingURL=payments.controller.js.map