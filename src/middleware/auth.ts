import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyAccessToken } from '../utils/jwt';
import redis from '../services/redis';

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.slice(7); // strip "Bearer "

  // Check if token has been blocklisted (i.e. user logged out)
  const isBlocklisted = await redis.get(`blocklist:${token}`);
  if (isBlocklisted) {
    return reply.status(401).send({ error: 'Token has been revoked. Please log in again.' });
  }

  try {
    const payload = verifyAccessToken(token);
    // Attach to request so route handlers can use it
    (request as any).user = payload;
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return reply.status(401).send({ error: 'Access token expired. Please refresh.' });
    }
    return reply.status(401).send({ error: 'Invalid access token' });
  }
}