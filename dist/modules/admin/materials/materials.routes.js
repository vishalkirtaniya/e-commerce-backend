"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = materialRoutes;
const verifyAdminJWT_js_1 = require("../middleware/verifyAdminJWT.js");
const requirePermission_js_1 = require("../middleware/requirePermission.js");
const db_js_1 = __importDefault(require("../../../services/db.js"));
const zod_1 = require("zod");
const CreateMaterialSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1),
    }),
});
async function materialRoutes(fastify) {
    // GET /admin/materials
    fastify.get("/materials", {
        preHandler: [verifyAdminJWT_js_1.verifyAdminJWT],
    }, async (_request, reply) => {
        try {
            const result = await db_js_1.default.query(`SELECT unnest(enum_range(NULL::material_type)) AS material`);
            return reply.send(result.rows.map((r) => r.material));
        }
        catch (err) {
            const message = err instanceof Error ? err.message : "Unexpected error";
            return reply.code(500).send({ error: message });
        }
    });
    // POST /admin/materials — adds a new value to the material_type enum
    fastify.post("/materials", {
        preHandler: [verifyAdminJWT_js_1.verifyAdminJWT, (0, requirePermission_js_1.requirePermission)("admin:manage")],
    }, async (request, reply) => {
        const parsed = CreateMaterialSchema.safeParse({ body: request.body });
        if (!parsed.success) {
            return reply.code(400).send({ error: parsed.error.flatten() });
        }
        try {
            const { name } = parsed.data.body;
            // Check if already exists
            const existing = await db_js_1.default.query(`SELECT EXISTS (
          SELECT 1 FROM pg_enum pe
          JOIN pg_type pt ON pt.oid = pe.enumtypid
          WHERE pt.typname = 'material_type'
          AND pe.enumlabel = $1
        ) AS exists`, [name]);
            if (existing.rows[0].exists) {
                return reply
                    .code(409)
                    .send({ error: `Material "${name}" already exists` });
            }
            // ALTER TYPE to add new enum value — must run outside transaction
            await db_js_1.default.query(`ALTER TYPE material_type ADD VALUE $1`, [name]);
            // Fetch updated list
            const result = await db_js_1.default.query(`SELECT unnest(enum_range(NULL::material_type)) AS material`);
            return reply
                .code(201)
                .send(result.rows.map((r) => r.material));
        }
        catch (err) {
            const message = err instanceof Error ? err.message : "Unexpected error";
            return reply.code(500).send({ error: message });
        }
    });
}
//# sourceMappingURL=materials.routes.js.map