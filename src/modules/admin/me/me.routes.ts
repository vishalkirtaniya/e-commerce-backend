import type { FastifyInstance } from 'fastify'
import { verifyAdminJWT } from '../middleware/verifyAdminJWT.js'
import { getMeHandler } from './me.controller.js'

export default async function meRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/me', {
    preHandler: [verifyAdminJWT],
  }, getMeHandler)
}