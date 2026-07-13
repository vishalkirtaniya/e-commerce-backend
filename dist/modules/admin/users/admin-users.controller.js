"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminUsersHandler = getAdminUsersHandler;
exports.getAdminRolesHandler = getAdminRolesHandler;
exports.getAdminAuditLogHandler = getAdminAuditLogHandler;
exports.createAdminUserHandler = createAdminUserHandler;
exports.deactivateAdminUserHandler = deactivateAdminUserHandler;
exports.reactivateAdminUserHandler = reactivateAdminUserHandler;
const admin_users_service_js_1 = require("./admin-users.service.js");
const auditLog_js_1 = require("../shared/auditLog.js");
const admin_users_schema_js_1 = require("./admin-users.schema.js");
async function getAdminUsersHandler(_request, reply) {
    try {
        const data = await (0, admin_users_service_js_1.getAllAdminUsers)();
        return reply.send(data);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        return reply.code(500).send({ error: message });
    }
}
async function getAdminRolesHandler(_request, reply) {
    try {
        const data = await (0, admin_users_service_js_1.getAllRoles)();
        return reply.send(data);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        return reply.code(500).send({ error: message });
    }
}
async function getAdminAuditLogHandler(request, reply) {
    try {
        const data = await (0, admin_users_service_js_1.getAdminAuditLog)(Number(request.params.id));
        return reply.send(data);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        return reply.code(500).send({ error: message });
    }
}
async function createAdminUserHandler(request, reply) {
    const result = admin_users_schema_js_1.CreateAdminUserSchema.safeParse({ body: request.body });
    if (!result.success) {
        return reply.code(400).send({ error: result.error.flatten() });
    }
    try {
        const data = await (0, admin_users_service_js_1.createAdminUser)(result.data.body);
        (0, auditLog_js_1.auditLog)({
            adminUserId: request.admin.adminUserId,
            action: "CREATE_ADMIN_USER",
            entity: "admin_users",
            entityId: data?.id,
            payload: {
                email: result.data.body.email,
                role_id: result.data.body.role_id,
            },
            ipAddress: request.ip,
        });
        return reply.code(201).send(data);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        const code = message === "No user found with that email"
            ? 404
            : message === "User is already an admin"
                ? 409
                : 500;
        return reply.code(code).send({ error: message });
    }
}
async function deactivateAdminUserHandler(request, reply) {
    const result = admin_users_schema_js_1.AdminUserParamsSchema.safeParse({ params: request.params });
    if (!result.success) {
        return reply.code(400).send({ error: result.error.flatten() });
    }
    try {
        const { id } = result.data.params;
        const data = await (0, admin_users_service_js_1.deactivateAdminUser)(id);
        (0, auditLog_js_1.auditLog)({
            adminUserId: request.admin.adminUserId,
            action: "DEACTIVATE_ADMIN_USER",
            entity: "admin_users",
            entityId: id,
            ipAddress: request.ip,
        });
        return reply.send(data);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        const code = message === "Admin user not found" ? 404 : 500;
        return reply.code(code).send({ error: message });
    }
}
async function reactivateAdminUserHandler(request, reply) {
    const result = admin_users_schema_js_1.AdminUserParamsSchema.safeParse({ params: request.params });
    if (!result.success) {
        return reply.code(400).send({ error: result.error.flatten() });
    }
    try {
        const { id } = result.data.params;
        const data = await (0, admin_users_service_js_1.reactivateAdminUser)(id);
        (0, auditLog_js_1.auditLog)({
            adminUserId: request.admin.adminUserId,
            action: "REACTIVATE_ADMIN_USER",
            entity: "admin_users",
            entityId: id,
            ipAddress: request.ip,
        });
        return reply.send(data);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        const code = message === "Admin user not found" ? 404 : 500;
        return reply.code(code).send({ error: message });
    }
}
//# sourceMappingURL=admin-users.controller.js.map