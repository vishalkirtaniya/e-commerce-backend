import { FastifyRequest, FastifyReply } from "fastify"
import { redis } from "../../services/redis"

import {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  createProduct
} from "./products.service"

export async function getProducts(req: FastifyRequest) {

  const cache = await redis.get("products")

  if (cache) {
    return JSON.parse(cache)
  }

  const products = await getAllProducts()

  await redis.set("products", JSON.stringify(products), "EX", 60)

  return products
}

export async function getProduct(req: FastifyRequest) {

  const { id } = req.params as any

  const cache = await redis.get(`product:${id}`)

  if (cache) {
    return JSON.parse(cache)
  }

  const product = await getProductById(id)

  await redis.set(`product:${id}`, JSON.stringify(product), "EX", 60)

  return product
}

export async function getProductsCategory(req: FastifyRequest) {

  const { category } = req.params as any

  const products = await getProductsByCategory(category)

  return products
}

export async function addProduct(req: FastifyRequest, reply: FastifyReply) {

  const product = req.body

  const newProduct = await createProduct(product)

  return newProduct
}