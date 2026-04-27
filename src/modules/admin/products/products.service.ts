import pool from "../../../services/db.js";
import type {
  CreateProductBody,
  UpdateProductBody,
} from "./products.schema.js";

export async function getAllProducts() {
  const result = await pool.query(`
    SELECT
      p.*,
      c.id   AS cat_id,
      c.name AS cat_name,
      c.slug AS cat_slug,
      COALESCE(
        json_agg(DISTINCT jsonb_build_object(
          'id', pi.id, 'url', pi.url,
          'is_primary', pi.is_primary,
          'sort_order', pi.sort_order
        )) FILTER (WHERE pi.id IS NOT NULL),
        '[]'
      ) AS product_images,
      COALESCE(
        json_agg(DISTINCT jsonb_build_object(
          'id', ps.id, 'label', ps.label,
          'price', ps.price, 'is_default', ps.is_default
        )) FILTER (WHERE ps.id IS NOT NULL),
        '[]'
      ) AS product_sizes
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN product_images pi ON pi.product_id = p.id
    LEFT JOIN product_sizes ps ON ps.product_id = p.id
    WHERE p.is_archived = false        -- ← exclude archived
    GROUP BY p.id, c.id
    ORDER BY p.created_at DESC
  `);

  return result.rows.map((r) => ({
    ...r,
    categories: { id: r.cat_id, name: r.cat_name, slug: r.cat_slug },
  }));
}

export async function getProductById(id: string) {
  const result = await pool.query(
    `
    SELECT
      p.*,
      c.id   AS cat_id,
      c.name AS cat_name,
      c.slug AS cat_slug,
      COALESCE(
        json_agg(DISTINCT jsonb_build_object(
          'id', pi.id, 'url', pi.url,
          'is_primary', pi.is_primary,
          'sort_order', pi.sort_order
        )) FILTER (WHERE pi.id IS NOT NULL),
        '[]'
      ) AS product_images,
      COALESCE(
        json_agg(DISTINCT jsonb_build_object(
          'id', ps.id, 'label', ps.label,
          'price', ps.price, 'is_default', ps.is_default
        )) FILTER (WHERE ps.id IS NOT NULL),
        '[]'
      ) AS product_sizes,
      COALESCE(
        json_agg(DISTINCT jsonb_build_object(
          'id', po.occasion_id,
          'name', o.name,
          'slug', o.slug
        )) FILTER (WHERE po.occasion_id IS NOT NULL),
        '[]'
      ) AS occasions
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN product_images pi ON pi.product_id = p.id
    LEFT JOIN product_sizes ps ON ps.product_id = p.id
    LEFT JOIN product_occasions po ON po.product_id = p.id
    LEFT JOIN occasions o ON o.id = po.occasion_id
    WHERE p.id = $1
    GROUP BY p.id, c.id
  `,
    [id],
  );

  if (result.rows.length === 0) throw new Error("Product not found");

  const r = result.rows[0];
  return {
    ...r,
    categories: { id: r.cat_id, name: r.cat_name, slug: r.cat_slug },
  };
}

export async function createProduct(body: CreateProductBody) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Insert the product
    const result = await client.query(
      `
      INSERT INTO products (
        sku, slug, name, description, material,
        price, original_price, discount, category_id,
        is_new_arrival, is_top_selling, is_customizable, is_sold_out
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9,
        $10, $11, $12, $13
      ) RETURNING *
      `,
      [
        body.sku,
        body.slug,
        body.name,
        body.description ?? null,
        body.material,
        body.price,
        body.original_price ?? null,
        body.discount ?? null,
        body.category_id,
        body.is_new_arrival,
        body.is_top_selling,
        body.is_customizable,
        body.is_sold_out ?? false,
      ],
    );

    const product = result.rows[0];

    // 2. Insert sizes if provided
    if (body.sizes && body.sizes.length > 0) {
      for (let i = 0; i < body.sizes.length; i++) {
        const size = body.sizes[i];
        await client.query(
          `INSERT INTO product_sizes (product_id, label, price, is_default)
           VALUES ($1, $2, $3, $4)`,
          [product.id, size.label, size.price, i === 0], // first size is default
        );
      }
    }

    await client.query("COMMIT");
    return product;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function updateProduct(id: string, body: UpdateProductBody) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Update product fields (excluding sizes)
    const { sizes, ...productFields } = body;
    const fields = Object.entries(productFields).filter(
      ([, v]) => v !== undefined,
    );

    if (fields.length > 0) {
      const setClauses = fields
        .map(([key], i) => `${key} = $${i + 1}`)
        .join(", ");
      const values = fields.map(([, v]) => v);

      const result = await client.query(
        `UPDATE products SET ${setClauses} WHERE id = $${fields.length + 1} RETURNING *`,
        [...values, id],
      );

      if (result.rows.length === 0) throw new Error("Product not found");
    }

    // 2. Replace sizes if provided
    if (sizes && sizes.length > 0) {
      // Delete existing sizes
      await client.query(`DELETE FROM product_sizes WHERE product_id = $1`, [
        id,
      ]);

      // Insert new sizes
      for (let i = 0; i < sizes.length; i++) {
        const size = sizes[i];
        await client.query(
          `INSERT INTO product_sizes (product_id, label, price, is_default)
           VALUES ($1, $2, $3, $4)`,
          [id, size.label, size.price, i === 0], // first size is default
        );
      }
    }

    await client.query("COMMIT");

    // Return updated product with sizes
    const updated = await pool.query(
      `SELECT p.*, 
        json_agg(json_build_object('id', ps.id, 'label', ps.label, 'price', ps.price, 'is_default', ps.is_default)) 
          FILTER (WHERE ps.id IS NOT NULL) AS sizes
       FROM products p
       LEFT JOIN product_sizes ps ON ps.product_id = p.id
       WHERE p.id = $1
       GROUP BY p.id`,
      [id],
    );

    return updated.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function deleteProduct(id: string) {
  // Check if product has been ordered
  const ordered = await pool.query(
    `SELECT COUNT(*)::int AS count FROM order_items WHERE product_id = $1`,
    [id],
  );

  if (ordered.rows[0].count > 0) {
    // Soft delete — archive instead of hard delete
    const result = await pool.query(
      `UPDATE products
       SET is_archived = true, is_sold_out = true
       WHERE id = $1 RETURNING *`,
      [id],
    );
    if (result.rows.length === 0) throw new Error("Product not found");
    return { archived: true, product: result.rows[0] };
  }

  // Hard delete — safe since no orders reference this product
  const result = await pool.query(
    `DELETE FROM products WHERE id = $1 RETURNING id`,
    [id],
  );
  if (result.rows.length === 0) throw new Error("Product not found");
  return { archived: false };
}

export async function toggleSoldOut(id: string, isSoldOut: boolean) {
  const result = await pool.query(
    `UPDATE products SET is_sold_out = $1 WHERE id = $2 RETURNING *`,
    [isSoldOut, id],
  );
  if (result.rows.length === 0) throw new Error("Product not found");
  return result.rows[0];
}
