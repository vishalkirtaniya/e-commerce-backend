import type { FastifyInstance, RouteGenericInterface } from "fastify";
import { verifyAdminJWT } from "../middleware/verifyAdminJWT.js";
import { requirePermission } from "../middleware/requirePermission.js";
import pool from "../../../services/db.js";

interface PeriodQuery {
  period?: string;
}
interface PeriodRoute extends RouteGenericInterface {
  Querystring: PeriodQuery;
}

export default async function analyticsRoutes(
  fastify: FastifyInstance,
): Promise<void> {
  // GET /admin/analytics/overview?period=30
  fastify.get<PeriodRoute>(
    "/analytics/overview",
    {
      preHandler: [verifyAdminJWT, requirePermission("analytics:read")],
    },
    async (request, reply) => {
      const days = parseInt(request.query.period ?? "30");
      try {
        const result = await pool.query(`
        WITH current_period AS (
          SELECT
            COALESCE(SUM(total), 0)         AS revenue,
            COUNT(*)::int                   AS orders,
            COALESCE(AVG(total), 0)         AS aov
          FROM orders
          WHERE created_at >= NOW() - INTERVAL '${days} days'
            AND status != 'CANCELLED'
        ),
        prev_period AS (
          SELECT
            COALESCE(SUM(total), 0)         AS revenue,
            COUNT(*)::int                   AS orders,
            COALESCE(AVG(total), 0)         AS aov
          FROM orders
          WHERE created_at >= NOW() - INTERVAL '${days * 2} days'
            AND created_at < NOW() - INTERVAL '${days} days'
            AND status != 'CANCELLED'
        ),
        customer_stats AS (
          SELECT
            COUNT(DISTINCT up.id)::int      AS total_customers,
            COUNT(DISTINCT o.user_id)::int  AS customers_with_orders
          FROM user_profiles up
          LEFT JOIN orders o ON o.user_id = up.id
        )
        SELECT
          c.revenue,
          c.orders,
          ROUND(c.aov::numeric, 0)          AS aov,
          CASE WHEN p.revenue > 0
            THEN ROUND(((c.revenue - p.revenue) / p.revenue * 100)::numeric, 1)
            ELSE 0 END                      AS revenue_delta,
          CASE WHEN p.orders > 0
            THEN ROUND(((c.orders - p.orders)::numeric / p.orders * 100), 1)
            ELSE 0 END                      AS orders_delta,
          CASE WHEN p.aov > 0
            THEN ROUND(((c.aov - p.aov) / p.aov * 100)::numeric, 1)
            ELSE 0 END                      AS aov_delta,
          cs.total_customers,
          cs.customers_with_orders,
          CASE WHEN cs.total_customers > 0
            THEN ROUND((cs.customers_with_orders::numeric / cs.total_customers * 100), 1)
            ELSE 0 END                      AS conversion_rate
        FROM current_period c, prev_period p, customer_stats cs
      `);
        return reply.send(result.rows[0]);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        return reply.code(500).send({ error: message });
      }
    },
  );

  // GET /admin/analytics/revenue?period=30
  fastify.get<PeriodRoute>(
    "/analytics/revenue",
    {
      preHandler: [verifyAdminJWT, requirePermission("analytics:read")],
    },
    async (request, reply) => {
      const days = parseInt(request.query.period ?? "30");
      try {
        // Group by day for ≤90 days, by week for ≤365
        const groupBy =
          days <= 90
            ? `DATE_TRUNC('day', created_at)`
            : `DATE_TRUNC('week', created_at)`;

        const result = await pool.query(`
        SELECT
          ${groupBy}                        AS period,
          COALESCE(SUM(total), 0)           AS revenue,
          COUNT(*)::int                     AS orders
        FROM orders
        WHERE created_at >= NOW() - INTERVAL '${days} days'
          AND status != 'CANCELLED'
        GROUP BY ${groupBy}
        ORDER BY period ASC
      `);
        return reply.send(result.rows);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        return reply.code(500).send({ error: message });
      }
    },
  );

  // GET /admin/analytics/orders-by-status?period=30
  fastify.get<PeriodRoute>(
    "/analytics/orders-by-status",
    {
      preHandler: [verifyAdminJWT, requirePermission("analytics:read")],
    },
    async (request, reply) => {
      const days = parseInt(request.query.period ?? "30");
      try {
        const result = await pool.query(`
        SELECT
          status,
          COUNT(*)::int   AS count,
          ROUND(COUNT(*)::numeric / SUM(COUNT(*)) OVER () * 100, 1) AS percentage
        FROM orders
        WHERE created_at >= NOW() - INTERVAL '${days} days'
        GROUP BY status
        ORDER BY count DESC
      `);
        return reply.send(result.rows);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        return reply.code(500).send({ error: message });
      }
    },
  );

  // GET /admin/analytics/top-products?period=30
  fastify.get<PeriodRoute>(
    "/analytics/top-products",
    {
      preHandler: [verifyAdminJWT, requirePermission("analytics:read")],
    },
    async (request, reply) => {
      const days = parseInt(request.query.period ?? "30");
      try {
        const result = await pool.query(`
        SELECT
          oi.product_id,
          oi.name,
          SUM(oi.price * oi.quantity)::numeric  AS revenue,
          SUM(oi.quantity)::int                 AS units_sold,
          COUNT(DISTINCT oi.order_id)::int      AS order_count
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        WHERE o.created_at >= NOW() - INTERVAL '${days} days'
          AND o.status != 'CANCELLED'
        GROUP BY oi.product_id, oi.name
        ORDER BY revenue DESC
        LIMIT 10
      `);
        return reply.send(result.rows);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        return reply.code(500).send({ error: message });
      }
    },
  );

  // GET /admin/analytics/revenue-by-material?period=30
  fastify.get<PeriodRoute>(
    "/analytics/revenue-by-material",
    {
      preHandler: [verifyAdminJWT, requirePermission("analytics:read")],
    },
    async (request, reply) => {
      const days = parseInt(request.query.period ?? "30");
      try {
        const result = await pool.query(`
        SELECT
          p.material,
          SUM(oi.price * oi.quantity)::numeric  AS revenue,
          SUM(oi.quantity)::int                 AS units_sold
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        JOIN products p ON p.id = oi.product_id
        WHERE o.created_at >= NOW() - INTERVAL '${days} days'
          AND o.status != 'CANCELLED'
        GROUP BY p.material
        ORDER BY revenue DESC
      `);
        return reply.send(result.rows);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        return reply.code(500).send({ error: message });
      }
    },
  );

  // GET /admin/analytics/revenue-by-category?period=30
  fastify.get<PeriodRoute>(
    "/analytics/revenue-by-category",
    {
      preHandler: [verifyAdminJWT, requirePermission("analytics:read")],
    },
    async (request, reply) => {
      const days = parseInt(request.query.period ?? "30");
      try {
        const result = await pool.query(`
        SELECT
          c.name                                AS category,
          SUM(oi.price * oi.quantity)::numeric  AS revenue,
          SUM(oi.quantity)::int                 AS units_sold
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        JOIN products p ON p.id = oi.product_id
        JOIN categories c ON c.id = p.category_id
        WHERE o.created_at >= NOW() - INTERVAL '${days} days'
          AND o.status != 'CANCELLED'
        GROUP BY c.name
        ORDER BY revenue DESC
      `);
        return reply.send(result.rows);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        return reply.code(500).send({ error: message });
      }
    },
  );

  // GET /admin/analytics/customer-growth?period=30
  fastify.get<PeriodRoute>(
    "/analytics/customer-growth",
    {
      preHandler: [verifyAdminJWT, requirePermission("analytics:read")],
    },
    async (request, reply) => {
      const days = parseInt(request.query.period ?? "30");
      try {
        const groupBy =
          days <= 90
            ? `DATE_TRUNC('day', created_at)`
            : `DATE_TRUNC('month', created_at)`;

        const result = await pool.query(`
        SELECT
          ${groupBy}        AS period,
          COUNT(*)::int     AS new_customers
        FROM user_profiles
        WHERE created_at >= NOW() - INTERVAL '${days} days'
        GROUP BY ${groupBy}
        ORDER BY period ASC
      `);
        return reply.send(result.rows);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        return reply.code(500).send({ error: message });
      }
    },
  );
}
