import { z } from 'zod';
export declare const UpdateOrderStatusSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        status: z.ZodString;
        label: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const OrderParamsSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export type OrderParams = {
    id: string;
};
export type UpdateOrderStatusBody = {
    status: string;
    label: string;
};
//# sourceMappingURL=orders.schema.d.ts.map