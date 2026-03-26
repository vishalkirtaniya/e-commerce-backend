import { z } from "zod";

// ── Query params for GET /api/products ───────────────────────
export const ProductsQuerySchema = z.object({
  // Filters
  category: z.string().optional(), // category slug e.g. "led-gifts"
  occasion: z.string().optional(), // occasion slug e.g. "birthday"
  material: z.enum(["Acrylic", "MDF", "Forex", "Wooden", "Mixed"]).optional(),
  min_price: z.coerce.number().min(0).optional(),
  max_price: z.coerce.number().min(0).optional(),

  // Sorting
  sort_by: z
    .enum(["price_asc", "price_desc", "rating", "newest"])
    .optional()
    .default("newest"),

  // Pagination
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(12),
});

export type ProductsQuery = z.infer<typeof ProductsQuerySchema>;
