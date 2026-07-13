import { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/auth";
import {
  getReviewsHandler,
  createReviewHandler,
} from "./customerReviews.controller";

export async function customerReviewRoutes(fastify: FastifyInstance) {
  // GET /api/reviews?limit=6&featured=true
  fastify.get("/", getReviewsHandler);

  // POST /api/reviews  (auth required)
  fastify.post("/", { preHandler: [authenticate] }, createReviewHandler);
}
