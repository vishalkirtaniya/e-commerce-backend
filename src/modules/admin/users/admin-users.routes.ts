import type { FastifyInstance, RouteGenericInterface } from "fastify";
import { verifyAdminJWT } from "../middleware/verifyAdminJWT.js";
import { requirePermission } from "../middleware/requirePermission.js";
import {
  getAdminUsersHandler,
  getAdminRolesHandler,
  getAdminAuditLogHandler,
  createAdminUserHandler,
  deactivateAdminUserHandler,
  reactivateAdminUserHandler,
} from "./admin-users.controller.js";
import type {
  CreateAdminUserBody,
  AdminUserParams,
} from "./admin-users.schema.js";

interface CreateAdminUserRoute extends RouteGenericInterface {
  Body: CreateAdminUserBody;
}
interface AdminUserParamsRoute extends RouteGenericInterface {
  Params: AdminUserParams;
}

export default async function adminUserRoutes(
  fastify: FastifyInstance,
): Promise<void> {
  // GET /admin/users
  fastify.get(
    "/users",
    {
      preHandler: [verifyAdminJWT, requirePermission("admin:manage")],
    },
    getAdminUsersHandler,
  );

  // GET /admin/users/roles
  fastify.get(
    "/users/roles",
    {
      preHandler: [verifyAdminJWT, requirePermission("admin:manage")],
    },
    getAdminRolesHandler,
  );

  // GET /admin/users/:id/audit-log
  fastify.get<AdminUserParamsRoute>(
    "/users/:id/audit-log",
    {
      preHandler: [verifyAdminJWT, requirePermission("admin:manage")],
    },
    getAdminAuditLogHandler,
  );

  // POST /admin/users
  fastify.post<CreateAdminUserRoute>(
    "/users",
    {
      preHandler: [verifyAdminJWT, requirePermission("admin:manage")],
    },
    createAdminUserHandler,
  );

  // PATCH /admin/users/:id/deactivate
  fastify.patch<AdminUserParamsRoute>(
    "/users/:id/deactivate",
    {
      preHandler: [verifyAdminJWT, requirePermission("admin:manage")],
    },
    deactivateAdminUserHandler,
  );

  // PATCH /admin/users/:id/reactivate
  fastify.patch<AdminUserParamsRoute>(
    "/users/:id/reactivate",
    {
      preHandler: [verifyAdminJWT, requirePermission("admin:manage")],
    },
    reactivateAdminUserHandler,
  );
}
