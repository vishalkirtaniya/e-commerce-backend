import { FastifyInstance } from "fastify"
import { topSelling } from "./topSelling.controller"
import { topSellingSchema } from "./topSelling.schema"

export default async function topSellingRoutes(app: FastifyInstance) {
  app.get("/products/top-selling", { ...topSellingSchema }, topSelling)
}