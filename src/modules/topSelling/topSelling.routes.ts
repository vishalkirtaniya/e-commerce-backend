import { FastifyInstance } from "fastify";
import { getTopSellingHandler } from "./topSelling.controller";

export async function topSellingRoutes(fastify: FastifyInstance) {
  // GET /api/top-selling?limit=8
  fastify.get("/", getTopSellingHandler);
}
