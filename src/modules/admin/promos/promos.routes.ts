import type { FastifyInstance, RouteGenericInterface } from "fastify";
import { verifyAdminJWT } from "../middleware/verifyAdminJWT.js";
import { requirePermission } from "../middleware/requirePermission.js";
import pool from "../../../services/db.js";
import { z } from "zod";

const CreatePromoSchema = z.object({
  body: z.object({
    code: z
      .string()
      .min(3)
      .max(20)
      .regex(/^[A-Z0-9]+$/, "Code must be uppercase letters and numbers only"),
    discount_percent: z.number().min(1).max(100),
    is_active: z.boolean().optional().default(true),
    expires_at: z.string().nullable().optional(),
  }),
});

const UpdatePromoSchema = z.object({
  body: z.object({
    code: z
      .string()
      .min(3)
      .max(20)
      .regex(/^[A-Z0-9]+$/)
      .optional(),
    discount_percent: z.number().min(1).max(100).optional(),
    is_active: z.boolean().optional(),
    expires_at: z.string().nullable().optional(),
  }),
});

interface PromoParams {
  id: string;
}
interface CreatePromoBody {
  code: string;
  discount_percent: number;
  is_active: boolean;
  expires_at: string | null;
}
interface UpdatePromoBody {
  code?: string;
  discount_percent?: number;
  is_active?: boolean;
  expires_at?: string | null;
}

interface CreateRoute extends RouteGenericInterface {
  Body: CreatePromoBody;
}
interface UpdateRoute extends RouteGenericInterface {
  Params: PromoParams;
  Body: UpdatePromoBody;
}
interface ParamsRoute extends RouteGenericInterface {
  Params: PromoParams;
}

export default async function promoRoutes(
  fastify: FastifyInstance,
): Promise<void> {
  // GET /admin/promos
  fastify.get(
    "/promos",
    {
      preHandler: [verifyAdminJWT, requirePermission("promo:read")],
    },
    async (_request, reply) => {
      try {
        const result = await pool.query(`
        SELECT
          p.*,
          COUNT(DISTINCT o.id)::int            AS times_used,
          COALESCE(SUM(o.discount_amount), 0)  AS total_discount_given
        FROM promo_codes p
        LEFT JOIN orders o ON o.promo_id = p.id
        GROUP BY p.id
        ORDER BY p.created_at DESC
      `);
        return reply.send(result.rows);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        return reply.code(500).send({ error: message });
      }
    },
  );

  // GET /admin/promos/stats
  fastify.get(
    "/promos/stats",
    {
      preHandler: [verifyAdminJWT, requirePermission("promo:read")],
    },
    async (_request, reply) => {
      try {
        const result = await pool.query(`
        SELECT
          COUNT(*)::int                                                     AS total,
          COUNT(*) FILTER (WHERE is_active = true
            AND (expires_at IS NULL OR expires_at > NOW()))::int           AS active,
          COUNT(*) FILTER (WHERE is_active = false)::int                   AS inactive,
          COUNT(*) FILTER (WHERE expires_at IS NOT NULL
            AND expires_at <= NOW())::int                                  AS expired,
          COALESCE((
            SELECT COUNT(DISTINCT o.id) FROM orders o
            JOIN promo_codes pc ON pc.id = o.promo_id
          ), 0)::int                                                        AS times_used,
          COALESCE((
            SELECT SUM(o.discount_amount) FROM orders o
            WHERE o.promo_id IS NOT NULL
          ), 0)::numeric                                                    AS total_discount_given
        FROM promo_codes
      `);
        return reply.send(result.rows[0]);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        return reply.code(500).send({ error: message });
      }
    },
  );

  // POST /admin/promos
  fastify.post<CreateRoute>(
    "/promos",
    {
      preHandler: [verifyAdminJWT, requirePermission("promo:write")],
    },
    async (request, reply) => {
      const parsed = CreatePromoSchema.safeParse({ body: request.body });
      if (!parsed.success)
        return reply.code(400).send({ error: parsed.error.flatten() });

      try {
        const { code, discount_percent, is_active, expires_at } =
          parsed.data.body;

        // Check duplicate
        const existing = await pool.query(
          `SELECT id FROM promo_codes WHERE code = $1`,
          [code],
        );
        if (existing.rows.length > 0) {
          return reply
            .code(409)
            .send({ error: `Promo code "${code}" already exists` });
        }

        const result = await pool.query(
          `INSERT INTO promo_codes (code, discount_percent, is_active, expires_at)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
          [code, discount_percent, is_active, expires_at || null],
        );
        return reply.code(201).send(result.rows[0]);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        return reply.code(500).send({ error: message });
      }
    },
  );

  // PATCH /admin/promos/:id
  fastify.patch<UpdateRoute>(
    "/promos/:id",
    {
      preHandler: [verifyAdminJWT, requirePermission("promo:write")],
    },
    async (request, reply) => {
      const parsed = UpdatePromoSchema.safeParse({ body: request.body });
      if (!parsed.success)
        return reply.code(400).send({ error: parsed.error.flatten() });

      try {
        const { id } = request.params;
        const fields = Object.entries(parsed.data.body).filter(
          ([, v]) => v !== undefined,
        );
        if (fields.length === 0)
          return reply.code(400).send({ error: "No fields to update" });

        const setClauses = fields
          .map(([key], i) => `${key} = $${i + 1}`)
          .join(", ");
        const values = fields.map(([, v]) => v);

        const result = await pool.query(
          `UPDATE promo_codes SET ${setClauses} WHERE id = $${fields.length + 1} RETURNING *`,
          [...values, id],
        );
        if (result.rows.length === 0)
          return reply.code(404).send({ error: "Promo not found" });
        return reply.send(result.rows[0]);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        return reply.code(500).send({ error: message });
      }
    },
  );

  // PATCH /admin/promos/:id/toggle
  fastify.patch<ParamsRoute>(
    "/promos/:id/toggle",
    {
      preHandler: [verifyAdminJWT, requirePermission("promo:write")],
    },
    async (request, reply) => {
      try {
        const result = await pool.query(
          `UPDATE promo_codes SET is_active = NOT is_active
         WHERE id = $1 RETURNING *`,
          [request.params.id],
        );
        if (result.rows.length === 0)
          return reply.code(404).send({ error: "Promo not found" });
        return reply.send(result.rows[0]);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        return reply.code(500).send({ error: message });
      }
    },
  );

  // DELETE /admin/promos/:id
  fastify.delete<ParamsRoute>(
    "/promos/:id",
    {
      preHandler: [verifyAdminJWT, requirePermission("promo:write")],
    },
    async (request, reply) => {
      try {
        // Check if promo has been used
        const used = await pool.query(
          `SELECT COUNT(*)::int AS count FROM orders WHERE promo_id = $1`,
          [request.params.id],
        );
        if (used.rows[0].count > 0) {
          return reply.code(409).send({
            error:
              "Cannot delete a promo that has been used in orders. Deactivate it instead.",
          });
        }

        const result = await pool.query(
          `DELETE FROM promo_codes WHERE id = $1 RETURNING id`,
          [request.params.id],
        );
        if (result.rows.length === 0)
          return reply.code(404).send({ error: "Promo not found" });
        return reply.code(204).send();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        return reply.code(500).send({ error: message });
      }
    },
  );
}
