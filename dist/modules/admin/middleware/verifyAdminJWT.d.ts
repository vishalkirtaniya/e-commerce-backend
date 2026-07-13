import type { FastifyRequest, FastifyReply } from 'fastify';
import type { AdminUser } from '../../../types/admin.js';
declare module 'fastify' {
    interface FastifyRequest {
        admin: AdminUser;
    }
}
export declare function verifyAdminJWT(request: FastifyRequest, reply: FastifyReply): Promise<void>;
//# sourceMappingURL=verifyAdminJWT.d.ts.map