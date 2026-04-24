import type { FastifyInstance, RouteGenericInterface } from "fastify";
import { verifyAdminJWT } from "../middleware/verifyAdminJWT.js";
import { requirePermission } from "../middleware/requirePermission.js";
import pool from "../../../services/db.js";
import { z } from "zod";

const CreateMaterialSchema = z.object({
  body: z.object({
    name: z.string().min(1),
  }),
});

interface CreateMaterialRoute extends RouteGenericInterface {
  Body: { name: string };
}

export default async function materialRoutes(
  fastify: FastifyInstance,
): Promise<void> {
  // GET /admin/materials
  fastify.get(
    "/materials",
    {
      preHandler: [verifyAdminJWT],
    },
    async (_request, reply) => {
      try {
        const result = await pool.query(
          `SELECT unnest(enum_range(NULL::material_type)) AS material`,
        );
        return reply.send(
          result.rows.map((r: { material: string }) => r.material),
        );
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        return reply.code(500).send({ error: message });
      }
    },
  );

  // POST /admin/materials — adds a new value to the material_type enum
  fastify.post<CreateMaterialRoute>(
    "/materials",
    {
      preHandler: [verifyAdminJWT, requirePermission("admin:manage")],
    },
    async (request, reply) => {
      const parsed = CreateMaterialSchema.safeParse({ body: request.body });
      if (!parsed.success) {
        return reply.code(400).send({ error: parsed.error.flatten() });
      }

      try {
        const { name } = parsed.data.body;

        // Check if already exists
        const existing = await pool.query(
          `SELECT EXISTS (
          SELECT 1 FROM pg_enum pe
          JOIN pg_type pt ON pt.oid = pe.enumtypid
          WHERE pt.typname = 'material_type'
          AND pe.enumlabel = $1
        ) AS exists`,
          [name],
        );

        if (existing.rows[0].exists) {
          return reply
            .code(409)
            .send({ error: `Material "${name}" already exists` });
        }

        // ALTER TYPE to add new enum value — must run outside transaction
        await pool.query(`ALTER TYPE material_type ADD VALUE $1`, [name]);

        // Fetch updated list
        const result = await pool.query(
          `SELECT unnest(enum_range(NULL::material_type)) AS material`,
        );
        return reply
          .code(201)
          .send(result.rows.map((r: { material: string }) => r.material));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        return reply.code(500).send({ error: message });
      }
    },
  );
}
