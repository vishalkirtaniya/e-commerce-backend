import pool from "../../services/db";
import type { PlaceOrderInput } from "./orders.schema";

// ── Helper: generate order number ─────────────────────────────
function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD-${ts}-${random}`;
}

// ── STATUS STEP CONFIG ────────────────────────────────────────
// Maps each order_status to a human-readable label + step index
const STATUS_STEPS = [
  { status: "PLACED", label: "Order Placed" },
  { status: "CONFIRMED", label: "Order Confirmed" },
  { status: "PACKED", label: "Packed" },
  { status: "SHIPPED", label: "Shipped" },
  { status: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { status: "DELIVERED", label: "Delivered" },
];

// ── GET /api/orders ───────────────────────────────────────────
export async function getOrders(userId: string) {
  const result = await pool.query(
    `SELECT
      o.id,
      o.order_number,
      o.status,
      o.total,
      o.created_at   AS date,
      o.estimated_delivery,
      -- First item name + image for preview
      (
        SELECT oi.name FROM order_items oi
        WHERE oi.order_id = o.id
        ORDER BY oi.id ASC LIMIT 1
      ) AS first_item_name,
      (
        SELECT oi.image_url FROM order_items oi
        WHERE oi.order_id = o.id
        ORDER BY oi.id ASC LIMIT 1
      ) AS first_item_image,
      -- Total item count
      (
        SELECT COUNT(*) FROM order_items oi
        WHERE oi.order_id = o.id
      ) AS item_count
    FROM orders o
    WHERE o.user_id = $1
    ORDER BY o.created_at DESC`,
    [userId],
  );

  return result.rows;
}

// ── GET /api/orders/:orderNumber ──────────────────────────────
export async function getOrderById(userId: string, orderNumber: string) {
  // 1. Main order row
  const orderResult = await pool.query(
    `SELECT
      o.id,
      o.order_number,
      o.status,
      o.subtotal,
      o.discount_amount,
      o.delivery_fee,
      o.total,
      o.payment_method,
      o.email,
      o.phone,
      o.estimated_delivery,
      o.created_at,
      -- Address snapshot
      a.first_name,
      a.last_name,
      a.street_address,
      a.city,
      a.state,
      a.zip_code,
      a.phone AS delivery_phone
    FROM orders o
    LEFT JOIN addresses a ON a.id = o.address_id
    WHERE o.order_number = $1 AND o.user_id = $2`,
    [orderNumber, userId],
  );

  if (orderResult.rows.length === 0) return null;

  const order = orderResult.rows[0];

  // 2. Order items
  const itemsResult = await pool.query(
    `SELECT
      id,
      name,
      image_url  AS image,
      price,
      size_label AS variant,
      quantity,
      customization
    FROM order_items
    WHERE order_id = $1
    ORDER BY id ASC`,
    [order.id],
  );

  // 3. Status history (progress tracker)
  const historyResult = await pool.query(
    `SELECT status, label, event_date AS date
     FROM order_status_history
     WHERE order_id = $1
     ORDER BY event_date ASC`,
    [order.id],
  );

  // 4. Compute current step index for the progress tracker
  const currentStepIndex = STATUS_STEPS.findIndex(
    (s) => s.status === order.status,
  );

  return {
    ...order,
    items: itemsResult.rows,
    steps: historyResult.rows,
    current_step: currentStepIndex,
  };
}

// ── POST /api/orders  (place order from cart) ─────────────────
export async function placeOrder(userId: string, input: PlaceOrderInput) {
  const {
    email,
    phone,
    first_name,
    last_name,
    street_address,
    city,
    state,
    zip_code,
    payment_method,
  } = input;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Get user's cart
    const cartResult = await client.query(
      `SELECT c.id, c.promo_id, pc.discount_percent
       FROM carts c
       LEFT JOIN promo_codes pc ON pc.id = c.promo_id
       WHERE c.user_id = $1`,
      [userId],
    );

    if (cartResult.rows.length === 0) {
      throw { statusCode: 400, message: "Cart not found" };
    }

    const cart = cartResult.rows[0];
    const discountPercent = cart.discount_percent
      ? parseFloat(cart.discount_percent)
      : 0;

    // 2. Get cart items with resolved prices
    const itemsResult = await client.query(
      `SELECT
        ci.id          AS cart_item_id,
        ci.quantity,
        ci.customization,
        p.id           AS product_id,
        p.name,
        ps.label       AS size_label,
        (
          SELECT pi.url FROM product_images pi
          WHERE pi.product_id = p.id AND pi.is_primary = TRUE
          LIMIT 1
        )              AS image_url,
        CASE
          WHEN ci.product_size_id IS NOT NULL THEN ps.price
          ELSE p.price
        END            AS unit_price
      FROM cart_items ci
      JOIN products p    ON p.id  = ci.product_id
      LEFT JOIN product_sizes ps ON ps.id = ci.product_size_id
      WHERE ci.cart_id = $1`,
      [cart.id],
    );

    if (itemsResult.rows.length === 0) {
      throw { statusCode: 400, message: "Your cart is empty" };
    }

    // 3. Compute totals
    const subtotal = itemsResult.rows.reduce(
      (sum: number, item: any) =>
        sum + parseFloat(item.unit_price) * item.quantity,
      0,
    );
    const deliveryFee = 99;
    const discountAmt = parseFloat(
      ((subtotal * discountPercent) / 100).toFixed(2),
    );
    const total = parseFloat((subtotal - discountAmt + deliveryFee).toFixed(2));

    // 4. Save shipping address
    const addressResult = await client.query(
      `INSERT INTO addresses
        (user_id, first_name, last_name, street_address, city, state, zip_code, phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        userId,
        first_name,
        last_name,
        street_address,
        city,
        state,
        zip_code,
        phone,
      ],
    );
    const addressId = addressResult.rows[0].id;

    // 5. Create order
    const orderNumber = generateOrderNumber();
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 7); // +7 days

    const orderResult = await client.query(
      `INSERT INTO orders
        (order_number, user_id, address_id, promo_id, status,
         subtotal, discount_amount, delivery_fee, total,
         payment_method, email, phone, estimated_delivery)
       VALUES ($1,$2,$3,$4,'PLACED',$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING id, order_number`,
      [
        orderNumber,
        userId,
        addressId,
        cart.promo_id ?? null,
        subtotal,
        discountAmt,
        deliveryFee,
        total,
        payment_method,
        email,
        phone,
        estimatedDelivery.toISOString().split("T")[0],
      ],
    );

    const { id: orderId, order_number } = orderResult.rows[0];

    // 6. Insert order items (snapshot product details)
    for (const item of itemsResult.rows) {
      await client.query(
        `INSERT INTO order_items
          (order_id, product_id, name, image_url, price, size_label, quantity, customization)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          orderId,
          item.product_id,
          item.name,
          item.image_url,
          item.unit_price,
          item.size_label ?? null,
          item.quantity,
          item.customization ?? null,
        ],
      );
    }

    // 7. Seed initial status history entry
    await client.query(
      `INSERT INTO order_status_history (order_id, status, label)
       VALUES ($1, 'PLACED', 'Order Placed')`,
      [orderId],
    );

    // 8. Clear the cart
    await client.query("DELETE FROM cart_items WHERE cart_id = $1", [cart.id]);
    await client.query("UPDATE carts SET promo_id = NULL WHERE id = $1", [
      cart.id,
    ]);

    await client.query("COMMIT");

    return {
      order_number,
      total,
      estimated_delivery: estimatedDelivery.toISOString().split("T")[0],
      message: "Order placed successfully",
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
