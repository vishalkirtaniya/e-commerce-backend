"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNewArrivals = getNewArrivals;
const db_1 = __importDefault(require("../../services/db"));
// ── GET /api/new-arrivals ─────────────────────────────────────
// Returns products flagged as is_new_arrival = TRUE
// sorted by newest first, with primary image + rating
async function getNewArrivals(limit = 8) {
    const result = await db_1.default.query(`SELECT
      p.id,
      p.slug,
      p.name,
      p.price,
      p.original_price,
      p.discount,
      p.rating,
      p.review_count,
      p.material,
      p.is_customizable,
      c.name AS category_name,
      c.slug AS category_slug,
      (
        SELECT pi.url
        FROM product_images pi
        WHERE pi.product_id = p.id AND pi.is_primary = TRUE
        LIMIT 1
      ) AS image
    FROM products p
    JOIN categories c ON c.id = p.category_id
    WHERE p.is_new_arrival = TRUE
    ORDER BY p.created_at DESC
    LIMIT $1`, [limit]);
    return result.rows;
}
//# sourceMappingURL=newArrivals.service.js.map