import pool from "../../../services/db.js";
import type { UpdateOrderStatusBody } from "./orders.schema.js";

export async function getAllOrders() {
  const result = await pool.query(`
    SELECT
      o.*,
      COALESCE(
        json_agg(DISTINCT jsonb_build_object(
          'id', oi.id,
          'product_id', oi.product_id,
          'name', oi.name,
          'image_url', oi.image_url,
          'price', oi.price,
          'size_label', oi.size_label,
          'quantity', oi.quantity,
          'customization', oi.customization
        )) FILTER (WHERE oi.id IS NOT NULL),
        '[]'
      ) AS order_items,
      row_to_json(a.*) AS addresses
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    LEFT JOIN addresses a ON a.id = o.address_id
    GROUP BY o.id, a.id
    ORDER BY o.created_at DESC
  `);
  return result.rows;
}

export async function getOrderStatus(id: string) {
  const result = await pool.query(`SELECT status FROM orders WHERE id = $1`, [
    id,
  ]);
  if (result.rows.length === 0) return null;
  return result.rows[0] as { status: string };
}

export async function updateOrderStatus(
  id: string,
  body: UpdateOrderStatusBody,
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const updateResult = await client.query(
      `UPDATE orders
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [body.status, id],
    );

    if (updateResult.rows.length === 0) {
      await client.query("ROLLBACK");
      throw new Error("Order not found");
    }

    await client.query(
      `INSERT INTO order_status_history (order_id, status, label)
       VALUES ($1, $2, $3)`,
      [Number(id), body.status, body.label],
    );

    await client.query("COMMIT");
    return updateResult.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
