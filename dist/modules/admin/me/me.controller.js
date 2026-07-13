"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMeHandler = getMeHandler;
async function getMeHandler(request, reply) {
    // request.admin is already populated by verifyAdminJWT
    return reply.send({
        adminUserId: request.admin.adminUserId,
        role: request.admin.role,
        permissions: Array.from(request.admin.permissions), // Set → array for JSON
    });
}
//# sourceMappingURL=me.controller.js.map