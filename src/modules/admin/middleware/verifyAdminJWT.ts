import type { FastifyRequest, FastifyReply } from 'fastify'
import jwt from 'jsonwebtoken'
import { getAdminWithPermissions } from '../shared/admin.service.js'
import type { AdminUser } from '../../../types/admin.js'

interface JwtPayload {
  sub: string
  iat: number
  exp: number
}

declare module 'fastify' {
  interface FastifyRequest {
    admin: AdminUser
  }
}

export async function verifyAdminJWT(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const authHeader = request.headers['authorization']

  if (!authHeader?.startsWith('Bearer ')) {
    return reply.code(401).send({ error: 'Missing or malformed Authorization header' })
  }

  const token = authHeader.slice(7)

  let payload: JwtPayload
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload
  } catch {
    return reply.code(401).send({ error: 'Invalid or expired token' })
  }

  const admin = await getAdminWithPermissions(payload.sub)

  if (!admin) {
    return reply.code(403).send({ error: 'Access denied: not an active admin' })
  }

  request.admin = admin
}