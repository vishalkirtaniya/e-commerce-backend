import { z } from "zod";

export const CreatePaymentOrderSchema = z.object({
  order_number: z.string().min(1, "Order number is required"),
});

export const VerifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
  order_number: z.string().min(1),
});

export const RefundSchema = z.object({
  order_number: z.string().min(1, "Order number is required"),
  amount: z.number().positive().optional(), // partial refund in paise; omit for full refund
  reason: z.string().optional(),
});

export type CreatePaymentOrderInput = z.infer<typeof CreatePaymentOrderSchema>;
export type VerifyPaymentInput = z.infer<typeof VerifyPaymentSchema>;
export type RefundInput = z.infer<typeof RefundSchema>;
