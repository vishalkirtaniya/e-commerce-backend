import { FastifyInstance } from "fastify";
import { customerReviews } from "./customerReviews.controller";
import { customerReviewsSchema } from "./customerReviews.schema";

export default async function customerReviewsRoutes(app: FastifyInstance) {
  app.get("/reviews/customer", { ...customerReviewsSchema }, customerReviews);
}
