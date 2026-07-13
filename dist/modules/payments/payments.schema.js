"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefundSchema = exports.VerifyPaymentSchema = exports.CreatePaymentOrderSchema = void 0;
const zod_1 = require("zod");
exports.CreatePaymentOrderSchema = zod_1.z.object({
    order_number: zod_1.z.string().min(1, "Order number is required"),
});
exports.VerifyPaymentSchema = zod_1.z.object({
    razorpay_order_id: zod_1.z.string().min(1),
    razorpay_payment_id: zod_1.z.string().min(1),
    razorpay_signature: zod_1.z.string().min(1),
    order_number: zod_1.z.string().min(1),
});
exports.RefundSchema = zod_1.z.object({
    order_number: zod_1.z.string().min(1, "Order number is required"),
    amount: zod_1.z.number().positive().optional(), // partial refund in paise; omit for full refund
    reason: zod_1.z.string().optional(),
});
//# sourceMappingURL=payments.schema.js.map