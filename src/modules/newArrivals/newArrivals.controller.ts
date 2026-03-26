import { FastifyRequest, FastifyReply } from 'fastify';
import { NewArrivalsQuerySchema } from './newArrivals.schema';
import { getNewArrivals } from './newArrivals.service';

// ── GET /api/new-arrivals ─────────────────────────────────────
export async function getNewArrivalsHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const parsed = NewArrivalsQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    return reply.status(400).send({ error: parsed.error.flatten().fieldErrors });
  }

  try {
    const data = await getNewArrivals(parsed.data.limit);
    return reply.status(200).send({ data });
  } catch (err) {
    request.log.error(err);
    return reply.status(500).send({ error: 'Failed to fetch new arrivals' });
  }
}