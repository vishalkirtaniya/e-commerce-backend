import { FastifyInstance } from 'fastify';
import { authenticate } from '../../middleware/auth';
import {
  signupHandler,
  signinHandler,
  refreshHandler,
  logoutHandler,
  meHandler,
} from './auth.controller';

export async function authRoutes(fastify: FastifyInstance) {
  // Public routes
  fastify.post('/signup',  signupHandler);
  fastify.post('/signin',  signinHandler);
  fastify.post('/refresh', refreshHandler);

  // Protected routes
  fastify.post('/logout', { preHandler: [authenticate] }, logoutHandler);
  fastify.get('/me',      { preHandler: [authenticate] }, meHandler);
}