"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePermission = requirePermission;
function requirePermission(key) {
    return async function (request, reply) {
        if (!request.admin?.permissions?.has(key)) {
            return reply.code(403).send({
                error: `Forbidden: requires permission '${key}'`,
            });
        }
    };
}
//# sourceMappingURL=requirePermission.js.map