import { z } from "zod";
declare const ProductSizeSchema: z.ZodObject<{
    label: z.ZodString;
    price: z.ZodNumber;
    is_default: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
export declare const CreateProductSchema: z.ZodObject<{
    body: z.ZodObject<{
        sku: z.ZodString;
        slug: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        material: z.ZodString;
        price: z.ZodNumber;
        original_price: z.ZodOptional<z.ZodNumber>;
        discount: z.ZodOptional<z.ZodNumber>;
        category_id: z.ZodNumber;
        is_new_arrival: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        is_top_selling: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        is_customizable: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        is_customizable_with_image: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        is_sold_out: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        sizes: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
            label: z.ZodString;
            price: z.ZodNumber;
            is_default: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        }, z.core.$strip>>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const UpdateProductSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        price: z.ZodOptional<z.ZodNumber>;
        original_price: z.ZodOptional<z.ZodNumber>;
        discount: z.ZodOptional<z.ZodNumber>;
        is_new_arrival: z.ZodOptional<z.ZodBoolean>;
        is_top_selling: z.ZodOptional<z.ZodBoolean>;
        is_customizable: z.ZodOptional<z.ZodBoolean>;
        is_customizable_with_image: z.ZodOptional<z.ZodBoolean>;
        is_sold_out: z.ZodOptional<z.ZodBoolean>;
        sizes: z.ZodOptional<z.ZodArray<z.ZodObject<{
            label: z.ZodString;
            price: z.ZodNumber;
            is_default: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const ProductParamsSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export type ProductParams = {
    id: string;
};
export type CreateProductBody = z.infer<typeof CreateProductSchema>["body"];
export type UpdateProductBody = z.infer<typeof UpdateProductSchema>["body"];
export type ProductSize = z.infer<typeof ProductSizeSchema>;
export {};
//# sourceMappingURL=products.schema.d.ts.map