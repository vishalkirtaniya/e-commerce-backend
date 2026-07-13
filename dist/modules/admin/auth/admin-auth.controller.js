"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminLoginHandler = adminLoginHandler;
const admin_auth_schema_js_1 = require("./admin-auth.schema.js");
const admin_auth_service_js_1 = require("./admin-auth.service.js");
async function adminLoginHandler(request, reply) {
    const result = admin_auth_schema_js_1.AdminLoginSchema.safeParse({ body: request.body });
    if (!result.success) {
        return reply.code(400).send({ error: result.error.flatten() });
    }
    try {
        const { email, password } = result.data.body;
        const data = await (0, admin_auth_service_js_1.adminLogin)(email, password);
        return reply.send(data);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        const code = message === "Access denied: not an active admin" ? 403 : 401;
        return reply.code(code).send({ error: message });
    }
}
//# sourceMappingURL=admin-auth.controller.js.map