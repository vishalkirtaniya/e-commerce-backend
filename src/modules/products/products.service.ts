import pool from '../../services/db';
import type { ProductsQuery } from './products.schema';

// ── GET /api/products  (shop page — filtered + paginated) ─────
export async function getProducts(query: ProductsQuery) {
  const {
    category,
    occasion,
    material,
    min_price,
    max_price,
    sort_by,
    page,
    limit,
  } = query;

  const offset = (page - 1) * limit;
  const params: any[] = [];
  let   paramIdx = 1;

  // ── WHERE clauses built dynamically ──────────────────────────
  const where: string[] = [];

  if (category) {
    params.push(category);
    where.push(`c.slug = $${paramIdx++}`);
  }

  if (material) {
    params.push(material);
    where.push(`p.material = $${paramIdx++}`);
  }

  if (min_price !== undefined) {
    params.push(min_price);
    where.push(`p.price >= $${paramIdx++}`);
  }

  if (max_price !== undefined) {
    params.push(max_price);
    where.push(`p.price <= $${paramIdx++}`);
  }

  // Occasion filter uses a subquery join
  if (occasion) {
    params.push(occasion);
    where.push(`
      EXISTS (
        SELECT 1 FROM product_occasions po
        JOIN occasions o ON o.id = po.occasion_id
        WHERE po.product_id = p.id AND o.slug = $${paramIdx++}
      )
    `);
  }

  const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';

  // ── ORDER BY ──────────────────────────────────────────────────
  const orderMap: Record<string, string> = {
    price_asc:  'p.price ASC',
    price_desc: 'p.price DESC',
    rating:     'p.rating DESC',
    newest:     'p.created_at DESC',
  };
  const orderSQL = orderMap[sort_by ?? 'newest'];

  // ── Main query ────────────────────────────────────────────────
  const dataQuery = `
    SELECT
      p.id,
      p.sku,
      p.slug,
      p.name,
      p.material,
      p.price,
      p.original_price,
      p.discount,
      p.rating,
      p.review_count,
      p.is_customizable,
      c.name  AS category_name,
      c.slug  AS category_slug,
      -- Primary image
      (
        SELECT pi.url
        FROM product_images pi
        WHERE pi.product_id = p.id AND pi.is_primary = TRUE
        LIMIT 1
      ) AS image,
      -- Occasions array
      COALESCE(
        (
          SELECT json_agg(o.name ORDER BY o.name)
          FROM product_occasions po
          JOIN occasions o ON o.id = po.occasion_id
          WHERE po.product_id = p.id
        ),
        '[]'::json
      ) AS occasions
    FROM products p
    JOIN categories c ON c.id = p.category_id
    ${whereSQL}
    ORDER BY ${orderSQL}
    LIMIT $${paramIdx++} OFFSET $${paramIdx++}
  `;

  params.push(limit, offset);

  // ── Count query (for pagination meta) ────────────────────────
  const countQuery = `
    SELECT COUNT(*) AS total
    FROM products p
    JOIN categories c ON c.id = p.category_id
    ${whereSQL}
  `;

  // Run both in parallel
  const [dataResult, countResult] = await Promise.all([
    pool.query(dataQuery, params),
    pool.query(countQuery, params.slice(0, params.length - 2)), // exclude limit/offset
  ]);

  const total      = parseInt(countResult.rows[0].total, 10);
  const totalPages = Math.ceil(total / limit);

  return {
    data: dataResult.rows,
    meta: {
      total,
      page,
      limit,
      total_pages: totalPages,
      has_next: page < totalPages,
      has_prev: page > 1,
    },
  };
}

// ── GET /api/products/:slug  (product detail page) ───────────
export async function getProductBySlug(slug: string) {
  // 1. Main product data
  const productResult = await pool.query(
    `SELECT
      p.id,
      p.sku,
      p.slug,
      p.name,
      p.description,
      p.material,
      p.price,
      p.original_price,
      p.discount,
      p.rating,
      p.review_count,
      p.is_customizable,
      c.name AS category_name,
      c.slug AS category_slug
    FROM products p
    JOIN categories c ON c.id = p.category_id
    WHERE p.slug = $1`,
    [slug]
  );

  if (productResult.rows.length === 0) {
    return null;
  }

  const product = productResult.rows[0];

  // 2. All images
  const imagesResult = await pool.query(
    `SELECT url, is_primary, sort_order
     FROM product_images
     WHERE product_id = $1
     ORDER BY is_primary DESC, sort_order ASC`,
    [product.id]
  );

  // 3. Size options
  const sizesResult = await pool.query(
    `SELECT id, label, price, is_default
     FROM product_sizes
     WHERE product_id = $1
     ORDER BY price ASC`,
    [product.id]
  );

  // 4. Occasions
  const occasionsResult = await pool.query(
    `SELECT o.name, o.slug
     FROM product_occasions po
     JOIN occasions o ON o.id = po.occasion_id
     WHERE po.product_id = $1`,
    [product.id]
  );

  // 5. Reviews for this product
  const reviewsResult = await pool.query(
    `SELECT id, name, rating, comment, verified, created_at
     FROM reviews
     WHERE product_id = $1
     ORDER BY created_at DESC
     LIMIT 10`,
    [product.id]
  );

  // 6. Related products — same category, exclude self, max 4
  const relatedResult = await pool.query(
    `SELECT
      p.id,
      p.slug,
      p.name,
      p.price,
      p.original_price,
      p.discount,
      p.rating,
      (
        SELECT pi.url FROM product_images pi
        WHERE pi.product_id = p.id AND pi.is_primary = TRUE
        LIMIT 1
      ) AS image
    FROM products p
    WHERE p.category_id = (
      SELECT category_id FROM products WHERE slug = $1
    )
    AND p.slug != $1
    ORDER BY p.rating DESC
    LIMIT 4`,
    [slug]
  );

  return {
    ...product,
    images:           imagesResult.rows,
    sizes:            sizesResult.rows,
    occasions:        occasionsResult.rows,
    reviews:          reviewsResult.rows,
    related_products: relatedResult.rows,
  };
}

// ── GET /api/products/filters  (sidebar filter options) ──────
export async function getFilterOptions() {
  const [categories, occasions, materials, priceRange] = await Promise.all([
    pool.query(`SELECT id, name, slug FROM categories ORDER BY name`),
    pool.query(`SELECT id, name, slug FROM occasions ORDER BY name`),
    pool.query(`SELECT DISTINCT material FROM products ORDER BY material`),
    pool.query(`SELECT MIN(price) AS min_price, MAX(price) AS max_price FROM products`),
  ]);

  return {
    categories:  categories.rows,
    occasions:   occasions.rows,
    materials:   materials.rows.map((r: any) => r.material),
    price_range: {
      min: parseFloat(priceRange.rows[0].min_price) || 0,
      max: parseFloat(priceRange.rows[0].max_price) || 10000,
    },
  };
}