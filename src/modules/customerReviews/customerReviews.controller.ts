import { FastifyRequest, FastifyReply } from 'fastify';
import { ReviewsQuerySchema, CreateReviewSchema } from './customerReviews.schema';
import * as ReviewsService from './customerReviews.service';

// ── GET /api/reviews ──────────────────────────────────────────
export async function getReviewsHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const parsed = ReviewsQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    return reply.status(400).send({ error: parsed.error.flatten().fieldErrors });
  }

  try {
    const data = await ReviewsService.getReviews(parsed.data);
    return reply.status(200).send({ data });
  } catch (err) {
    request.log.error(err);
    return reply.status(500).send({ error: 'Failed to fetch reviews' });
  }
}

// ── POST /api/reviews ─────────────────────────────────────────
export async function createReviewHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const parsed = CreateReviewSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: parsed.error.flatten().fieldErrors });
  }

  const userId = (request as any).user.userId;

  try {
    const review = await ReviewsService.createReview(parsed.data, userId);
    return reply.status(201).send(review);
  } catch (err: any) {
    request.log.error(err);
    return reply.status(err.statusCode ?? 500).send({ error: err.message ?? 'Failed to create review' });
  }
}