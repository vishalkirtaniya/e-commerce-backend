import type { FastifyRequest, FastifyReply } from "fastify";
import {
  getAllAdminUsers,
  createAdminUser,
  deactivateAdminUser,
} from "./admin-users.service.js";
import { auditLog } from "../shared/auditLog.js";
import {
  CreateAdminUserSchema,
  AdminUserParamsSchema,
} from "./admin-users.schema.js";
import type {
  CreateAdminUserBody,
  AdminUserParams,
} from "./admin-users.schema.js";

export async function getAdminUsersHandler(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const data = await getAllAdminUsers();
    return reply.send(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return reply.code(500).send({ error: message });
  }
}

export async function createAdminUserHandler(
  request: FastifyRequest<{ Body: CreateAdminUserBody }>,
  reply: FastifyReply,
) {
  const result = CreateAdminUserSchema.safeParse({ body: request.body });
  if (!result.success) {
    return reply.code(400).send({ error: result.error.flatten() });
  }

  try {
    const data = await createAdminUser(result.data.body);

    auditLog({
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    const code =
      message === "No user found with that email"
        ? 404
        : message === "User is already an admin"
          ? 409
          : 500;
    return reply.code(code).send({ error: message });
  }
}

export async function deactivateAdminUserHandler(
  request: FastifyRequest<{ Params: AdminUserParams }>,
  reply: FastifyReply,
) {
  const result = AdminUserParamsSchema.safeParse({ params: request.params });
  if (!result.success) {
    return reply.code(400).send({ error: result.error.flatten() });
  }

  try {
    const { id } = result.data.params;
    const data = await deactivateAdminUser(id);

    auditLog({
      adminUserId: request.admin.adminUserId,
      action: "DEACTIVATE_ADMIN_USER",
      entity: "admin_users",
      entityId: id,
      ipAddress: request.ip,
    });

    return reply.send(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    const code = message === "Admin user not found" ? 404 : 500;
    return reply.code(code).send({ error: message });
  }
}
