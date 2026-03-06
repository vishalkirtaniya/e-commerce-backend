import { FastifyRequest, FastifyReply } from "fastify"

import {
  getUserCart,
  createCart,
  addCartItem,
  getCartItems,
  removeCartItem
} from "./cart.service"

export async function addToCart(req: any, reply: FastifyReply) {

  const userId = req.userId
  const { productId, quantity } = req.body

  let cart = await getUserCart(userId)

  if (!cart) {
    cart = await createCart(userId)
  }

  const item = await addCartItem(cart.id, productId, quantity)

  return item
}

export async function getCart(req: any) {

  const userId = req.userId

  const cart = await getUserCart(userId)

  if (!cart) {
    return []
  }

  const items = await getCartItems(cart.id)

  return items
}

export async function deleteCartItem(req: FastifyRequest) {

  const { id } = req.params as any

  await removeCartItem(id)

  return { message: "Item removed" }
}