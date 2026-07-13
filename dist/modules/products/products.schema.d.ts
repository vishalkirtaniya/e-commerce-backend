import { z } from "zod";
export declare const ProductsQuerySchema: z.ZodObject<{
    category: z.ZodOptional<z.ZodString>;
    occasion: z.ZodOptional<z.ZodString>;
    material: z.ZodOptional<z.ZodEnum<{
        Acrylic: "Acrylic";
        MDF: "MDF";
        Forex: "Forex";
        Wooden: "Wooden";
        Mixed: "Mixed";
    }>>;
    min_price: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    max_price: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    sort_by: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        price_asc: "price_asc";
        price_desc: "price_desc";
        rating: "rating";
        newest: "newest";
    }>>>;
    page: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
}, z.core.$strip>;
export type ProductsQuery = z.infer<typeof ProductsQuerySchema>;
//# sourceMappingURL=products.schema.d.ts.map