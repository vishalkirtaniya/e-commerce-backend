import { z } from "zod";
export declare const TopSellingQuerySchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
}, z.core.$strip>;
export type TopSellingQuery = z.infer<typeof TopSellingQuerySchema>;
//# sourceMappingURL=topSelling.schema.d.ts.map