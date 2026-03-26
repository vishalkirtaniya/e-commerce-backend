import { z } from "zod";

export const NewArrivalsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).optional().default(8),
});

export type NewArrivalsQuery = z.infer<typeof NewArrivalsQuerySchema>;
