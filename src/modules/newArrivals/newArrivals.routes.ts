import { FastifyInstance } from "fastify"
import { newArrivals } from "./newArrivals.controller"
import { newArrivalsSchema } from "./newArrivals.schema"

export default async function newArrivalsRoutes(app: FastifyInstance) {
  app.get("/products/new-arrivals", { ...newArrivalsSchema }, newArrivals)
}