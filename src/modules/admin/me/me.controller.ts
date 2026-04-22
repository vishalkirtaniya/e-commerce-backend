import type { FastifyRequest, FastifyReply } from 'fastify'

export async function getMeHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  // request.admin is already populated by verifyAdminJWT
  return reply.send({
    adminUserId: request.admin.adminUserId,
    role: request.admin.role,
    permissions: Array.from(request.admin.permissions), // Set → array for JSON
  })
}