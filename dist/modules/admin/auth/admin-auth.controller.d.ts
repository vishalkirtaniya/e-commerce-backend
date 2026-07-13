import type { FastifyRequest, FastifyReply } from "fastify";
import type { AdminLoginBody } from "./admin-auth.schema.js";
export declare function adminLoginHandler(request: FastifyRequest<{
    Body: AdminLoginBody;
}>, reply: FastifyReply): Promise<never>;
//# sourceMappingURL=admin-auth.controller.d.ts.map