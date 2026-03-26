import pool from "../../services/db";
import type { ReviewsQuery, CreateReviewInput } from "./customerReviews.schema";

// ── GET /api/reviews ──────────────────────────────────────────
// Homepage carousel — featured reviews only by default
export async function getReviews(query: ReviewsQuery) {
  const { limit, featured } = query;
  const onlyFeatured = featured === "true";

  const result = await pool.query(
    `SELECT
      r.id,
      r.name,
      r.rating,
      r.comment,
      r.verified,
      r.created_at,
      p.name  AS product_name,
      p.slug  AS product_slug
    FROM reviews r
    LEFT JOIN products p ON p.id = r.product_id
    ${onlyFeatured ? "WHERE r.is_featured = TRUE" : ""}
    ORDER BY r.created_at DESC
    LIMIT $1`,
    [limit],
  );

  return result.rows;
}

// ── POST /api/reviews ─────────────────────────────────────────
// Authenticated users can submit a review
export async function createReview(input: CreateReviewInput, userId: string) {
  const { product_id, name, rating, comment } = input;

  // 1. Make sure product exists
  const product = await pool.query("SELECT id FROM products WHERE id = $1", [
    product_id,
  ]);
  if (product.rows.length === 0) {
    throw { statusCode: 404, message: "Product not found" };
  }

  // 2. One review per user per product
  const existing = await pool.query(
    "SELECT id FROM reviews WHERE product_id = $1 AND user_id = $2",
    [product_id, userId],
  );
  if (existing.rows.length > 0) {
    throw {
      statusCode: 409,
      message: "You have already reviewed this product",
    };
  }

  // 3. Insert review
  const result = await pool.query(
    `INSERT INTO reviews (product_id, user_id, name, rating, comment, verified)
     VALUES ($1, $2, $3, $4, $5, TRUE)
     RETURNING id, name, rating, comment, verified, created_at`,
    [product_id, userId, name, rating, comment ?? null],
  );

  // 4. Update product rating + review_count (running average)
  await pool.query(
    `UPDATE products SET
      review_count = review_count + 1,
      rating = (
        SELECT ROUND(AVG(rating)::numeric, 1)
        FROM reviews
        WHERE product_id = $1
      )
    WHERE id = $1`,
    [product_id],
  );

  return result.rows[0];
}
