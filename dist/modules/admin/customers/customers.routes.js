"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = customerRoutes;
const verifyAdminJWT_js_1 = require("../middleware/verifyAdminJWT.js");
const requirePermission_js_1 = require("../middleware/requirePermission.js");
const db_js_1 = __importDefault(require("../../../services/db.js"));
async function customerRoutes(fastify) {
    // GET /admin/customers
    fastify.get('/customers', {
        preHandler: [verifyAdminJWT_js_1.verifyAdminJWT, (0, requirePermission_js_1.requirePermission)('users:read')],
    }, async (_request, reply) => {
        try {
            const result = await db_js_1.default.query(`
        SELECT
          up.id,
          up.full_name,
          up.phone,
          up.created_at,
          uc.email,
          COUNT(DISTINCT o.id)::int            AS order_count,
          COALESCE(SUM(o.total), 0)::numeric   AS total_spent,
          MAX(o.created_at)                    AS last_order_at,
          COALESCE(
            json_agg(
              jsonb_build_object(
                'id',           o.id,
                'order_number', o.order_number,
                'total',        o.total,
                'status',       o.status,
                'created_at',   o.created_at
              ) ORDER BY o.created_at DESC
            ) FILTER (WHERE o.id IS NOT NULL),
            '[]'
          ) AS orders
        FROM user_profiles up
        JOIN user_credentials uc ON uc.id = up.id
        LEFT JOIN orders o ON o.user_id = up.id
        GROUP BY up.id, up.full_name, up.phone, up.created_at, uc.email
        ORDER BY up.created_at DESC
      `);
            return reply.send(result.rows);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Unexpected error';
            return reply.code(500).send({ error: message });
        }
    });
    // GET /admin/customers/stats
    fastify.get('/customers/stats', {
        preHandler: [verifyAdminJWT_js_1.verifyAdminJWT, (0, requirePermission_js_1.requirePermission)('users:read')],
    }, async (_request, reply) => {
        try {
            const result = await db_js_1.default.query(`
        SELECT
          COUNT(DISTINCT up.id)::int                                        AS total_customers,
          COUNT(DISTINCT CASE
            WHEN up.created_at >= date_trunc('month', NOW()) THEN up.id
          END)::int                                                         AS new_this_month,
          COUNT(DISTINCT CASE
            WHEN o.id IS NOT NULL THEN up.id
          END)::int                                                         AS with_orders,
          COALESCE(
            ROUND(AVG(customer_totals.total_spent)::numeric, 0), 0
          )::numeric                                                        AS avg_order_value
        FROM user_profiles up
        JOIN user_credentials uc ON uc.id = up.id
        LEFT JOIN orders o ON o.user_id = up.id
        LEFT JOIN (
          SELECT user_id, SUM(total) AS total_spent
          FROM orders
          GROUP BY user_id
        ) customer_totals ON customer_totals.user_id = up.id
      `);
            return reply.send(result.rows[0]);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Unexpected error';
            return reply.code(500).send({ error: message });
        }
    });
}
//# sourceMappingURL=customers.routes.js.map