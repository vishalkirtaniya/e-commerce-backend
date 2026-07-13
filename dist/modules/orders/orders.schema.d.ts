import { z } from 'zod';
export declare const PlaceOrderSchema: z.ZodObject<{
    email: z.ZodString;
    phone: z.ZodString;
    first_name: z.ZodString;
    last_name: z.ZodString;
    street_address: z.ZodString;
    city: z.ZodString;
    state: z.ZodString;
    zip_code: z.ZodString;
    payment_method: z.ZodString;
}, z.core.$strip>;
export type PlaceOrderInput = z.infer<typeof PlaceOrderSchema>;
//# sourceMappingURL=orders.schema.d.ts.map