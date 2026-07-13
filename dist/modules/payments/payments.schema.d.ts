import { z } from "zod";
export declare const CreatePaymentOrderSchema: z.ZodObject<{
    order_number: z.ZodString;
}, z.core.$strip>;
export declare const VerifyPaymentSchema: z.ZodObject<{
    razorpay_order_id: z.ZodString;
    razorpay_payment_id: z.ZodString;
    razorpay_signature: z.ZodString;
    order_number: z.ZodString;
}, z.core.$strip>;
export declare const RefundSchema: z.ZodObject<{
    order_number: z.ZodString;
    amount: z.ZodOptional<z.ZodNumber>;
    reason: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreatePaymentOrderInput = z.infer<typeof CreatePaymentOrderSchema>;
export type VerifyPaymentInput = z.infer<typeof VerifyPaymentSchema>;
export type RefundInput = z.infer<typeof RefundSchema>;
//# sourceMappingURL=payments.schema.d.ts.map