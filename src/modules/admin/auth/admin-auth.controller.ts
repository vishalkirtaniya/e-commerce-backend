import type { FastifyRequest, FastifyReply } from "fastify";
import { AdminLoginSchema } from "./admin-auth.schema.js";
import { adminLogin } from "./admin-auth.service.js";
import type { AdminLoginBody } from "./admin-auth.schema.js";

export async function adminLoginHandler(
  request: FastifyRequest<{ Body: AdminLoginBody }>,
  reply: FastifyReply,
) {
  const result = AdminLoginSchema.safeParse({ body: request.body });
  if (!result.success) {
    return reply.code(400).send({ error: result.error.flatten() });
  }

  try {
    const { email, password } = result.data.body;
    const data = await adminLogin(email, password);
    return reply.send(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    const code = message === "Access denied: not an active admin" ? 403 : 401;
    return reply.code(code).send({ error: message });
  }
}
