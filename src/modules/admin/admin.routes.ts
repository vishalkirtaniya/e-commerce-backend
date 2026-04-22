import type { FastifyInstance } from 'fastify'
import orderRoutes from './orders/orders.routes'
import productRoutes from './products/products.routes'
import meRoutes from './me/me.routes'

export default async function adminRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.register(orderRoutes)
  fastify.register(productRoutes)
  fastify.register(meRoutes)
  // future: fastify.register(userRoutes)
  // future: fastify.register(analyticsRoutes)
}