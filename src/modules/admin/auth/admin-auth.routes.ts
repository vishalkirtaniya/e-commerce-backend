import type { FastifyInstance, RouteGenericInterface } from "fastify";
import { adminLoginHandler } from "./admin-auth.controller.js";
import type { AdminLoginBody } from "./admin-auth.schema.js";

interface AdminLoginRoute extends RouteGenericInterface {
  Body: AdminLoginBody;
}

export default async function adminAuthRoutes(
  fastify: FastifyInstance,
): Promise<void> {
  // POST /admin/login — no JWT guard, this is the login endpoint
  fastify.post<AdminLoginRoute>("/login", {}, adminLoginHandler);
}
