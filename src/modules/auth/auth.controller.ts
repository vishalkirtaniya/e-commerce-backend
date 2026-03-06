import { FastifyRequest, FastifyReply } from "fastify"
import { createUser, findUserByEmail } from "./auth.service"
import { hashPassword, comparePassword } from "../../utils/hash"
import { signToken } from "../../utils/jwt"
import { redis } from "../../services/redis"
import { randomUUID } from "crypto"
import { verifyToken } from "../../utils/jwt"

export async function signup(req: FastifyRequest, reply: FastifyReply) {
  const { name, email, password } = req.body as any

  const existing = await findUserByEmail(email)

  if (existing) {
    return reply.status(400).send({
      error: "User already exists"
    })
  }

  const password_hash = await hashPassword(password)

  const user = await createUser({
    name,
    email,
    password_hash
  })

  return {
    message: "User created",
    user
  }
}

export async function login(req: FastifyRequest, reply: FastifyReply) {
  const { email, password } = req.body as any

  const user = await findUserByEmail(email)

  if (!user) {
    return reply.status(401).send({
      error: "Invalid credentials"
    })
  }

  const valid = await comparePassword(password, user.password_hash)

  if (!valid) {
    return reply.status(401).send({
      error: "Invalid credentials"
    })
  }

  const sessionId = randomUUID()

  const token = signToken({
    userId: user.id,
    sessionId
  })

  await redis.set(
    `session:${sessionId}`,
    JSON.stringify({
      userId: user.id
    }),
    "EX",
    60 * 60 * 24
  )

  return {
    token
  }
}

export async function logout(req: any, reply: any) {

  const authHeader = req.headers.authorization

  if (!authHeader) {
    return reply.status(401).send({ error: "Unauthorized" })
  }

  const token = authHeader.split(" ")[1]

  const payload: any = verifyToken(token)

  await redis.del(`session:${payload.sessionId}`)

  return { message: "Logged out successfully" }

}