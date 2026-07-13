import { FastifyInstance } from 'fastify';
import { getNewArrivalsHandler } from './newArrivals.controller';

export async function newArrivalsRoutes(fastify: FastifyInstance) {
  // GET /api/new-arrivals?limit=8
  fastify.get('/', getNewArrivalsHandler);
}