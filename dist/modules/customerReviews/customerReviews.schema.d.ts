import { z } from 'zod';
export declare const ReviewsQuerySchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
    featured: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        true: "true";
        false: "false";
    }>>>;
}, z.core.$strip>;
export declare const CreateReviewSchema: z.ZodObject<{
    product_id: z.ZodNumber;
    name: z.ZodString;
    rating: z.ZodNumber;
    comment: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ReviewsQuery = z.infer<typeof ReviewsQuerySchema>;
export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;
//# sourceMappingURL=customerReviews.schema.d.ts.map