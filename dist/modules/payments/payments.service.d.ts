import type { CreatePaymentOrderInput, VerifyPaymentInput, RefundInput } from "./payments.schema";
export declare function createPaymentOrder(userId: string, input: CreatePaymentOrderInput): Promise<{
    razorpay_order_id: string;
    amount: number;
    currency: string;
    order_number: string;
    key_id: string | undefined;
}>;
export declare function verifyPayment(userId: string, input: VerifyPaymentInput): Promise<{
    message: string;
    order_number: string;
    razorpay_payment_id: string;
}>;
export declare function handleWebhook(rawBody: string, signature: string): Promise<{
    received: boolean;
}>;
export declare function refundPayment(userId: string, input: RefundInput): Promise<{
    message: string;
    refund_id: string;
    refund_amount: number;
    order_number: string;
}>;
//# sourceMappingURL=payments.service.d.ts.map