import type { FastifyRequest, FastifyReply } from 'fastify'
import type { PermissionKey } from '../../../types/admin.js'

export function requirePermission(key: PermissionKey) {
  return async function (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    if (!request.admin?.permissions?.has(key)) {
      return reply.code(403).send({
        error: `Forbidden: requires permission '${key}'`,
      })
    }
  }
}