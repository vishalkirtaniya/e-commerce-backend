import { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';

export async function registerPlugins(fastify: FastifyInstance) {
  await fastify.register(cors, {
    origin: process.env.NODE_ENV === 'production'
      ? ['https://your-frontend-domain.com']
      : true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
}