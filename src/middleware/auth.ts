import { FastifyRequest, FastifyReply } from "fastify"
import { verifyToken } from "../utils/jwt"
import { redis } from "../services/redis"

export async function authMiddleware(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return reply.status(401).send({
      error: "Unauthorized"
    })
  }

  const token = authHeader.split(" ")[1]

  try {
    const payload: any = verifyToken(token)

    const session = await redis.get(`session:${payload.sessionId}`)

    if (!session) {
      return reply.status(401).send({
        error: "Session expired"
      })
    }

    ;(req as any).userId = payload.userId

  } catch (err) {
    return reply.status(401).send({
      error: "Invalid token"
    })
  }
}