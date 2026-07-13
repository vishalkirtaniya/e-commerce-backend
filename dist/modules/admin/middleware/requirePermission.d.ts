import type { FastifyRequest, FastifyReply } from 'fastify';
import type { PermissionKey } from '../../../types/admin.js';
export declare function requirePermission(key: PermissionKey): (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
//# sourceMappingURL=requirePermission.d.ts.map