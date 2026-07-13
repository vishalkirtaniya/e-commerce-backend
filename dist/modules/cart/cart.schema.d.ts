import { z } from "zod";
export declare const AddToCartSchema: z.ZodObject<{
    product_id: z.ZodNumber;
    product_size_id: z.ZodOptional<z.ZodNumber>;
    quantity: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    customization: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const UpdateCartItemSchema: z.ZodObject<{
    quantity: z.ZodNumber;
}, z.core.$strip>;
export declare const ApplyPromoSchema: z.ZodObject<{
    code: z.ZodString;
}, z.core.$strip>;
export type AddToCartInput = z.infer<typeof AddToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof UpdateCartItemSchema>;
export type ApplyPromoInput = z.infer<typeof ApplyPromoSchema>;
//# sourceMappingURL=cart.schema.d.ts.map