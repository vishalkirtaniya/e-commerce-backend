import { z } from "zod";
export declare const NewArrivalsQuerySchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
}, z.core.$strip>;
export type NewArrivalsQuery = z.infer<typeof NewArrivalsQuerySchema>;
//# sourceMappingURL=newArrivals.schema.d.ts.map