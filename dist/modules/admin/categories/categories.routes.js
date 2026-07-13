"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = categoryRoutes;
const verifyAdminJWT_js_1 = require("../middleware/verifyAdminJWT.js");
const requirePermission_js_1 = require("../middleware/requirePermission.js");
const db_js_1 = __importDefault(require("../../../services/db.js"));
const zod_1 = require("zod");
const CreateCategorySchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1),
        slug: zod_1.z.string().min(1),
    }),
});
async function categoryRoutes(fastify) {
    // GET /admin/categories
    fastify.get("/categories", {
        preHandler: [verifyAdminJWT_js_1.verifyAdminJWT],
    }, async (_request, reply) => {
        try {
            const result = await db_js_1.default.query(`SELECT id, name, slug FROM categories ORDER BY name ASC`);
            return reply.send(result.rows);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : "Unexpected error";
            return reply.code(500).send({ error: message });
        }
    });
    // POST /admin/categories
    fastify.post("/categories", {
        preHandler: [verifyAdminJWT_js_1.verifyAdminJWT, (0, requirePermission_js_1.requirePermission)("products:write")],
    }, async (request, reply) => {
        const parsed = CreateCategorySchema.safeParse({ body: request.body });
        if (!parsed.success) {
            return reply.code(400).send({ error: parsed.error.flatten() });
        }
        try {
            const { name, slug } = parsed.data.body;
            // Check duplicate
            const existing = await db_js_1.default.query(`SELECT id FROM categories WHERE name = $1 OR slug = $2`, [name, slug]);
            if (existing.rows.length > 0) {
                return reply
                    .code(409)
                    .send({ error: "Category with this name or slug already exists" });
            }
            const result = await db_js_1.default.query(`INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING *`, [name, slug]);
            return reply.code(201).send(result.rows[0]);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : "Unexpected error";
            return reply.code(500).send({ error: message });
        }
    });
}
//# sourceMappingURL=categories.routes.js.map