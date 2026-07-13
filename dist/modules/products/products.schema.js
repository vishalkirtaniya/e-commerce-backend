"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsQuerySchema = void 0;
const zod_1 = require("zod");
// ── Query params for GET /api/products ───────────────────────
exports.ProductsQuerySchema = zod_1.z.object({
    // Filters
    category: zod_1.z.string().optional(), // category slug e.g. "led-gifts"
    occasion: zod_1.z.string().optional(), // occasion slug e.g. "birthday"
    material: zod_1.z.enum(["Acrylic", "MDF", "Forex", "Wooden", "Mixed"]).optional(),
    min_price: zod_1.z.coerce.number().min(0).optional(),
    max_price: zod_1.z.coerce.number().min(0).optional(),
    // Sorting
    sort_by: zod_1.z
        .enum(["price_asc", "price_desc", "rating", "newest"])
        .optional()
        .default("newest"),
    // Pagination
    page: zod_1.z.coerce.number().int().min(1).optional().default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(50).optional().default(12),
});
//# sourceMappingURL=products.schema.js.map