import { FastifyInstance } from "fastify"

import {
  addToCart,
  getCart,
  deleteCartItem
} from "./cart.controller"

import { authMiddleware } from "../../middleware/auth"

export default async function cartRoutes(app: FastifyInstance) {

  app.post(
    "/cart/add",
    { preHandler: authMiddleware },
    addToCart
  )

  app.get(
    "/cart",
    { preHandler: authMiddleware },
    getCart
  )

  app.delete(
    "/cart/item/:id",
    { preHandler: authMiddleware },
    deleteCartItem
  )

}