import { z } from "zod";

export const TopSellingQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).optional().default(8),
});

export type TopSellingQuery = z.infer<typeof TopSellingQuerySchema>;
