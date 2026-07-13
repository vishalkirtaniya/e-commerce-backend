"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = adminUserRoutes;
const verifyAdminJWT_js_1 = require("../middleware/verifyAdminJWT.js");
const requirePermission_js_1 = require("../middleware/requirePermission.js");
const admin_users_controller_js_1 = require("./admin-users.controller.js");
async function adminUserRoutes(fastify) {
    // GET /admin/users
    fastify.get("/users", {
        preHandler: [verifyAdminJWT_js_1.verifyAdminJWT, (0, requirePermission_js_1.requirePermission)("admin:manage")],
    }, admin_users_controller_js_1.getAdminUsersHandler);
    // GET /admin/users/roles
    fastify.get("/users/roles", {
        preHandler: [verifyAdminJWT_js_1.verifyAdminJWT, (0, requirePermission_js_1.requirePermission)("admin:manage")],
    }, admin_users_controller_js_1.getAdminRolesHandler);
    // GET /admin/users/:id/audit-log
    fastify.get("/users/:id/audit-log", {
        preHandler: [verifyAdminJWT_js_1.verifyAdminJWT, (0, requirePermission_js_1.requirePermission)("admin:manage")],
    }, admin_users_controller_js_1.getAdminAuditLogHandler);
    // POST /admin/users
    fastify.post("/users", {
        preHandler: [verifyAdminJWT_js_1.verifyAdminJWT, (0, requirePermission_js_1.requirePermission)("admin:manage")],
    }, admin_users_controller_js_1.createAdminUserHandler);
    // PATCH /admin/users/:id/deactivate
    fastify.patch("/users/:id/deactivate", {
        preHandler: [verifyAdminJWT_js_1.verifyAdminJWT, (0, requirePermission_js_1.requirePermission)("admin:manage")],
    }, admin_users_controller_js_1.deactivateAdminUserHandler);
    // PATCH /admin/users/:id/reactivate
    fastify.patch("/users/:id/reactivate", {
        preHandler: [verifyAdminJWT_js_1.verifyAdminJWT, (0, requirePermission_js_1.requirePermission)("admin:manage")],
    }, admin_users_controller_js_1.reactivateAdminUserHandler);
}
//# sourceMappingURL=admin-users.routes.js.map