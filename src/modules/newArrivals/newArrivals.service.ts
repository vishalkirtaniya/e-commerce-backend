import pool from '../../services/db';

// ── GET /api/new-arrivals ─────────────────────────────────────
// Returns products flagged as is_new_arrival = TRUE
// sorted by newest first, with primary image + rating
export async function getNewArrivals(limit = 8) {
  const result = await pool.query(
    `SELECT
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
    LIMIT $1`,
    [limit]
  );

  return result.rows;
}