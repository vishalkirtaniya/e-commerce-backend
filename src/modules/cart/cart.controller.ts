import { FastifyRequest, FastifyReply } from "fastify"

import {
  getUserCart,
  addCartItem,
  removeCartItem
} from "./cart.service"

export async function addToCart(req: any, reply: FastifyReply) {
  const userId = req.userId
  const { productId, quantity } = req.body

  const item = await addCartItem(userId, productId, quantity)

  return item
}

export async function getCart(req: any) {
  const userId = req.userId

  const items = await getUserCart(userId)

  return items
}

export async function deleteCartItem(req: FastifyRequest) {
  const { id } = req.params as any

  await removeCartItem(id)

  return { message: "Item removed" }
}
