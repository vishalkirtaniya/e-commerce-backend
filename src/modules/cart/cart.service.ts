import pool from "../../services/db";
import type {
  AddToCartInput,
  UpdateCartItemInput,
  ApplyPromoInput,
} from "./cart.schema";

// ── Helper: get or create cart for user ───────────────────────
async function getOrCreateCart(userId: string): Promise<number> {
  const existing = await pool.query("SELECT id FROM carts WHERE user_id = $1", [
    userId,
  ]);
  if (existing.rows.length > 0) return existing.rows[0].id;

  const created = await pool.query(
    "INSERT INTO carts (user_id) VALUES ($1) RETURNING id",
    [userId],
  );
  return created.rows[0].id;
}

// ── Helper: compute cart summary ──────────────────────────────
async function getCartSummary(cartId: number) {
  // Get promo attached to cart
  const cartRow = await pool.query(
    `SELECT c.promo_id, pc.discount_percent
     FROM carts c
     LEFT JOIN promo_codes pc ON pc.id = c.promo_id
     WHERE c.id = $1`,
    [cartId],
  );

  const cart = cartRow.rows[0];
  const discountPercent: number = cart?.discount_percent
    ? parseFloat(cart.discount_percent)
    : 0;

  // Sum up items
  const totalsRow = await pool.query(
    `SELECT COALESCE(SUM(
      CASE
        WHEN ci.product_size_id IS NOT NULL THEN ps.price * ci.quantity
        ELSE p.price * ci.quantity
      END
    ), 0) AS subtotal
    FROM cart_items ci
    JOIN products p ON p.id = ci.product_id
    LEFT JOIN product_sizes ps ON ps.id = ci.product_size_id
    WHERE ci.cart_id = $1`,
    [cartId],
  );

  const subtotal = parseFloat(totalsRow.rows[0].subtotal);
  const deliveryFee = subtotal > 0 ? 99 : 0; // flat ₹99 delivery
  const discountAmt = parseFloat(
    ((subtotal * discountPercent) / 100).toFixed(2),
  );
  const total = parseFloat((subtotal - discountAmt + deliveryFee).toFixed(2));

  return {
    subtotal,
    discount_percent: discountPercent,
    discount_amount: discountAmt,
    delivery_fee: deliveryFee,
    total,
  };
}

// ── GET /api/cart ─────────────────────────────────────────────
export async function getCart(userId: string) {
  const cartId = await getOrCreateCart(userId);

  const itemsResult = await pool.query(
    `SELECT
      ci.id            AS cart_item_id,
      ci.quantity,
      ci.customization,
      p.id             AS product_id,
      p.slug,
      p.name,
      p.material,
      p.is_customizable,
      ps.id            AS size_id,
      ps.label         AS size_label,
      CASE
        WHEN ci.product_size_id IS NOT NULL THEN ps.price
        ELSE p.price
      END              AS price,
      (
        SELECT pi.url FROM product_images pi
        WHERE pi.product_id = p.id AND pi.is_primary = TRUE
        LIMIT 1
      )                AS image
    FROM cart_items ci
    JOIN products p ON p.id = ci.product_id
    LEFT JOIN product_sizes ps ON ps.id = ci.product_size_id
    WHERE ci.cart_id = $1
    ORDER BY ci.id ASC`,
    [cartId],
  );

  const summary = await getCartSummary(cartId);

  return {
    cart_id: cartId,
    items: itemsResult.rows,
    summary,
  };
}

// ── POST /api/cart ────────────────────────────────────────────
export async function addToCart(userId: string, input: AddToCartInput) {
  const { product_id, product_size_id, quantity, customization } = input;
  const cartId = await getOrCreateCart(userId);

  // Validate product exists
  const product = await pool.query("SELECT id FROM products WHERE id = $1", [
    product_id,
  ]);
  if (product.rows.length === 0) {
    throw { statusCode: 404, message: "Product not found" };
  }

  // Validate size belongs to product (if provided)
  if (product_size_id) {
    const size = await pool.query(
      "SELECT id FROM product_sizes WHERE id = $1 AND product_id = $2",
      [product_size_id, product_id],
    );
    if (size.rows.length === 0) {
      throw { statusCode: 400, message: "Invalid size for this product" };
    }
  }

  // Upsert — if same product+size already in cart, increment quantity
  const result = await pool.query(
    `INSERT INTO cart_items (cart_id, product_id, product_size_id, quantity, customization)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (cart_id, product_id, product_size_id)
     DO UPDATE SET
       quantity      = cart_items.quantity + EXCLUDED.quantity,
       customization = EXCLUDED.customization
     RETURNING *`,
    [
      cartId,
      product_id,
      product_size_id ?? null,
      quantity,
      customization ?? null,
    ],
  );

  return result.rows[0];
}

// ── PATCH /api/cart/:itemId ───────────────────────────────────
export async function updateCartItem(
  userId: string,
  itemId: number,
  input: UpdateCartItemInput,
) {
  // Ensure the item belongs to this user's cart
  const owned = await pool.query(
    `SELECT ci.id FROM cart_items ci
     JOIN carts c ON c.id = ci.cart_id
     WHERE ci.id = $1 AND c.user_id = $2`,
    [itemId, userId],
  );
  if (owned.rows.length === 0) {
    throw { statusCode: 404, message: "Cart item not found" };
  }

  const result = await pool.query(
    `UPDATE cart_items SET quantity = $1
     WHERE id = $2
     RETURNING *`,
    [input.quantity, itemId],
  );

  return result.rows[0];
}

// ── DELETE /api/cart/:itemId ──────────────────────────────────
export async function removeCartItem(userId: string, itemId: number) {
  const owned = await pool.query(
    `SELECT ci.id FROM cart_items ci
     JOIN carts c ON c.id = ci.cart_id
     WHERE ci.id = $1 AND c.user_id = $2`,
    [itemId, userId],
  );
  if (owned.rows.length === 0) {
    throw { statusCode: 404, message: "Cart item not found" };
  }

  await pool.query("DELETE FROM cart_items WHERE id = $1", [itemId]);
  return { message: "Item removed from cart" };
}

// ── DELETE /api/cart ──────────────────────────────────────────
export async function clearCart(userId: string) {
  const cartId = await getOrCreateCart(userId);
  await pool.query("DELETE FROM cart_items WHERE cart_id = $1", [cartId]);
  // Also remove any applied promo
  await pool.query("UPDATE carts SET promo_id = NULL WHERE id = $1", [cartId]);
  return { message: "Cart cleared" };
}

// ── POST /api/cart/promo ──────────────────────────────────────
export async function applyPromo(userId: string, input: ApplyPromoInput) {
  const cartId = await getOrCreateCart(userId);

  // Look up promo code
  const promo = await pool.query(
    `SELECT id, discount_percent
     FROM promo_codes
     WHERE code = $1
       AND is_active = TRUE
       AND (expires_at IS NULL OR expires_at > NOW())`,
    [input.code.toUpperCase()],
  );

  if (promo.rows.length === 0) {
    throw { statusCode: 400, message: "Invalid or expired promo code" };
  }

  const { id: promoId, discount_percent } = promo.rows[0];

  // Attach promo to cart
  await pool.query("UPDATE carts SET promo_id = $1 WHERE id = $2", [
    promoId,
    cartId,
  ]);

  return {
    message: "Promo code applied successfully",
    discount_percent: parseFloat(discount_percent),
  };
}

// ── DELETE /api/cart/promo ────────────────────────────────────
export async function removePromo(userId: string) {
  const cartId = await getOrCreateCart(userId);
  await pool.query("UPDATE carts SET promo_id = NULL WHERE id = $1", [cartId]);
  return { message: "Promo code removed" };
}
