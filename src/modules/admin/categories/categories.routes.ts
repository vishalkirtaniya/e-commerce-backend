import type { FastifyInstance, RouteGenericInterface } from "fastify";
import { verifyAdminJWT } from "../middleware/verifyAdminJWT.js";
import { requirePermission } from "../middleware/requirePermission.js";
import pool from "../../../services/db.js";
import { z } from "zod";

const CreateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1),
    slug: z.string().min(1),
  }),
});

interface CreateCategoryRoute extends RouteGenericInterface {
  Body: { name: string; slug: string };
}

export default async function categoryRoutes(
  fastify: FastifyInstance,
): Promise<void> {
  // GET /admin/categories
  fastify.get(
    "/categories",
    {
      preHandler: [verifyAdminJWT],
    },
    async (_request, reply) => {
      try {
        const result = await pool.query(
          `SELECT id, name, slug FROM categories ORDER BY name ASC`,
        );
        return reply.send(result.rows);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        return reply.code(500).send({ error: message });
      }
    },
  );

  // POST /admin/categories
  fastify.post<CreateCategoryRoute>(
    "/categories",
    {
      preHandler: [verifyAdminJWT, requirePermission("products:write")],
    },
    async (request, reply) => {
      const parsed = CreateCategorySchema.safeParse({ body: request.body });
      if (!parsed.success) {
        return reply.code(400).send({ error: parsed.error.flatten() });
      }

      try {
        const { name, slug } = parsed.data.body;

        // Check duplicate
        const existing = await pool.query(
          `SELECT id FROM categories WHERE name = $1 OR slug = $2`,
          [name, slug],
        );
        if (existing.rows.length > 0) {
          return reply
            .code(409)
            .send({ error: "Category with this name or slug already exists" });
        }

        const result = await pool.query(
          `INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING *`,
          [name, slug],
        );
        return reply.code(201).send(result.rows[0]);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        return reply.code(500).send({ error: message });
      }
    },
  );
}
