import type { FastifyRequest, FastifyReply } from "fastify";
import type { CreateAdminUserBody, AdminUserParams } from "./admin-users.schema.js";
export declare function getAdminUsersHandler(_request: FastifyRequest, reply: FastifyReply): Promise<never>;
export declare function getAdminRolesHandler(_request: FastifyRequest, reply: FastifyReply): Promise<never>;
export declare function getAdminAuditLogHandler(request: FastifyRequest<{
    Params: AdminUserParams;
}>, reply: FastifyReply): Promise<never>;
export declare function createAdminUserHandler(request: FastifyRequest<{
    Body: CreateAdminUserBody;
}>, reply: FastifyReply): Promise<never>;
export declare function deactivateAdminUserHandler(request: FastifyRequest<{
    Params: AdminUserParams;
}>, reply: FastifyReply): Promise<never>;
export declare function reactivateAdminUserHandler(request: FastifyRequest<{
    Params: AdminUserParams;
}>, reply: FastifyReply): Promise<never>;
//# sourceMappingURL=admin-users.controller.d.ts.map