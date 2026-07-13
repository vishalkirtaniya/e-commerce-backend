import crypto from "crypto";
import razorpay from "../../services/razorpay";
import pool from "../../services/db";
import type {
  CreatePaymentOrderInput,
  VerifyPaymentInput,
  RefundInput,
} from "./payments.schema";

// ── POST /api/payments/create-order ──────────────────────────
// Creates a Razorpay order and stores a PENDING payment record
export async function createPaymentOrder(
  userId: string,
  input: CreatePaymentOrderInput,
) {
  const { order_number } = input;

  // 1. Fetch our order — must belong to this user
  const orderResult = await pool.query(
    `SELECT id, total, status
     FROM orders
     WHERE order_number = $1 AND user_id = $2`,
    [order_number, userId],
  );

  if (orderResult.rows.length === 0) {
    throw { statusCode: 404, message: "Order not found" };
  }

  const order = orderResult.rows[0];

  // 2. Don't allow duplicate payment on already-paid order
  const existingPayment = await pool.query(
    `SELECT id, status FROM payments
     WHERE order_id = $1 AND status = 'PAID'`,
    [order.id],
  );
  if (existingPayment.rows.length > 0) {
    throw { statusCode: 409, message: "Order has already been paid" };
  }

  // 3. Amount in paise (Razorpay requires integer paise)
  const amountPaise = Math.round(parseFloat(order.total) * 100);

  // 4. Create Razorpay order
  const rzOrder = await razorpay.orders.create({
    amount: amountPaise,
    currency: "INR",
    receipt: order_number,
    notes: { order_number, user_id: userId },
  });

  // 5. Store PENDING payment record
  await pool.query(
    `INSERT INTO payments
      (order_id, razorpay_order_id, amount, amount_paise, currency, status)
     VALUES ($1, $2, $3, $4, 'INR', 'PENDING')
     ON CONFLICT (razorpay_order_id) DO NOTHING`,
    [order.id, rzOrder.id, order.total, amountPaise],
  );

  return {
    razorpay_order_id: rzOrder.id,
    amount: amountPaise,
    currency: "INR",
    order_number,
    // Frontend needs key_id to initialise Razorpay checkout
    key_id: process.env.RAZORPAY_KEY_ID,
  };
}

// ── POST /api/payments/verify ─────────────────────────────────
// Verifies Razorpay signature — marks payment + order as confirmed
export async function verifyPayment(userId: string, input: VerifyPaymentInput) {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    order_number,
  } = input;

  // 1. Verify HMAC signature
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");

  if (expected !== razorpay_signature) {
    throw { statusCode: 400, message: "Invalid payment signature" };
  }

  // 2. Fetch our order
  const orderResult = await pool.query(
    `SELECT id FROM orders WHERE order_number = $1 AND user_id = $2`,
    [order_number, userId],
  );
  if (orderResult.rows.length === 0) {
    throw { statusCode: 404, message: "Order not found" };
  }
  const orderId = orderResult.rows[0].id;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 3. Update payment record to PAID
    await client.query(
      `UPDATE payments SET
        razorpay_payment_id = $1,
        razorpay_signature  = $2,
        status              = 'PAID'
       WHERE razorpay_order_id = $3`,
      [razorpay_payment_id, razorpay_signature, razorpay_order_id],
    );

    // 4. Advance order status to CONFIRMED
    await client.query(`UPDATE orders SET status = 'CONFIRMED' WHERE id = $1`, [
      orderId,
    ]);

    // 5. Append to order status history
    await client.query(
      `INSERT INTO order_status_history (order_id, status, label)
       VALUES ($1, 'CONFIRMED', 'Order Confirmed')`,
      [orderId],
    );

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  return {
    message: "Payment verified successfully",
    order_number,
    razorpay_payment_id,
  };
}

// ── POST /api/payments/webhook ────────────────────────────────
// Razorpay server-to-server webhook — handles async events
export async function handleWebhook(rawBody: string, signature: string) {
  // 1. Verify webhook signature
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;
  const expected = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  if (expected !== signature) {
    throw { statusCode: 400, message: "Invalid webhook signature" };
  }

  const event = JSON.parse(rawBody);
  const eventType: string = event.event;

  // 2. Handle relevant events
  switch (eventType) {
    case "payment.captured": {
      const payment = event.payload.payment.entity;
      const rzOrderId = payment.order_id;
      const rzPaymentId = payment.id;

      // Mark payment PAID if not already done via /verify
      await pool.query(
        `UPDATE payments SET
          razorpay_payment_id = $1,
          status              = 'PAID'
         WHERE razorpay_order_id = $2 AND status != 'PAID'`,
        [rzPaymentId, rzOrderId],
      );
      break;
    }

    case "payment.failed": {
      const payment = event.payload.payment.entity;
      const rzOrderId = payment.order_id;
      const reason = payment.error_description ?? "Payment failed";

      await pool.query(
        `UPDATE payments SET
          status         = 'FAILED',
          failure_reason = $1
         WHERE razorpay_order_id = $2`,
        [reason, rzOrderId],
      );
      break;
    }

    case "refund.created": {
      const refund = event.payload.refund.entity;
      const rzOrderId = refund.notes?.razorpay_order_id;

      if (rzOrderId) {
        await pool.query(
          `UPDATE payments SET
            refund_id     = $1,
            refund_amount = $2,
            status        = 'REFUNDED'
           WHERE razorpay_order_id = $3`,
          [refund.id, refund.amount / 100, rzOrderId],
        );
      }
      break;
    }

    default:
      // Unhandled event — log and ignore
      console.log(`Unhandled Razorpay webhook event: ${eventType}`);
  }

  return { received: true };
}

// ── POST /api/payments/refund ─────────────────────────────────
// Initiates a refund for a paid order
export async function refundPayment(userId: string, input: RefundInput) {
  const { order_number, amount, reason } = input;

  // 1. Fetch order + payment
  const result = await pool.query(
    `SELECT o.id AS order_id, o.total, o.status,
            p.razorpay_payment_id, p.amount_paise, p.status AS payment_status
     FROM orders o
     JOIN payments p ON p.order_id = o.id
     WHERE o.order_number = $1 AND o.user_id = $2`,
    [order_number, userId],
  );

  if (result.rows.length === 0) {
    throw { statusCode: 404, message: "Order or payment not found" };
  }

  const row = result.rows[0];

  if (row.payment_status !== "PAID") {
    throw { statusCode: 400, message: "Only paid orders can be refunded" };
  }

  if (!row.razorpay_payment_id) {
    throw { statusCode: 400, message: "No payment ID found for this order" };
  }

  // 2. Amount in paise — full refund if not specified
  const refundPaise = amount ? Math.round(amount * 100) : row.amount_paise;

  // 3. Initiate refund via Razorpay
  const refund = await razorpay.payments.refund(row.razorpay_payment_id, {
    amount: refundPaise,
    notes: { reason: reason ?? "Customer requested refund", order_number },
  });

  const isPartial = refundPaise < row.amount_paise;

  // 4. Update payment record
  await pool.query(
    `UPDATE payments SET
      refund_id     = $1,
      refund_amount = $2,
      status        = $3
     WHERE razorpay_payment_id = $4`,
    [
      refund.id,
      refundPaise / 100,
      isPartial ? "PARTIALLY_REFUNDED" : "REFUNDED",
      row.razorpay_payment_id,
    ],
  );

  // 5. Update order status history
  await pool.query(
    `INSERT INTO order_status_history (order_id, status, label)
     VALUES ($1, 'CONFIRMED', $2)`,
    [row.order_id, isPartial ? "Partially Refunded" : "Refunded"],
  );

  return {
    message: isPartial ? "Partial refund initiated" : "Full refund initiated",
    refund_id: refund.id,
    refund_amount: refundPaise / 100,
    order_number,
  };
}
