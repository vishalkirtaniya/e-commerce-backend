import type { FastifyInstance, RouteGenericInterface } from "fastify";
import { verifyAdminJWT } from "../middleware/verifyAdminJWT.js";
import { requirePermission } from "../middleware/requirePermission.js";
import {
  getAdminUsersHandler,
  createAdminUserHandler,
  deactivateAdminUserHandler,
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
  // GET /admin/users — list all admins
  fastify.get(
    "/users",
    {
      preHandler: [verifyAdminJWT, requirePermission("admin:manage")],
    },
    getAdminUsersHandler,
  );

  // POST /admin/users — promote a user to admin
  fastify.post<CreateAdminUserRoute>(
    "/users",
    {
      preHandler: [verifyAdminJWT, requirePermission("admin:manage")],
    },
    createAdminUserHandler,
  );

  // PATCH /admin/users/:id/deactivate — revoke admin access
  fastify.patch<AdminUserParamsRoute>(
    "/users/:id/deactivate",
    {
      preHandler: [verifyAdminJWT, requirePermission("admin:manage")],
    },
    deactivateAdminUserHandler,
  );
}
