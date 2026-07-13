import { z } from 'zod';

export const ReviewsQuerySchema = z.object({
  limit:    z.coerce.number().int().min(1).max(20).optional().default(6),
  featured: z.enum(['true', 'false']).optional().default('true'),
});

export const CreateReviewSchema = z.object({
  product_id: z.number().int().positive(),
  name:       z.string().min(2, 'Name must be at least 2 characters'),
  rating:     z.number().int().min(1).max(5),
  comment:    z.string().min(5, 'Comment must be at least 5 characters').optional(),
});

export type ReviewsQuery    = z.infer<typeof ReviewsQuerySchema>;
export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;