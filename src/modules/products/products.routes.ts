import { FastifyInstance } from "fastify"

import {
  getProducts,
  getProduct,
  getProductsCategory,
  addProduct
} from "./products.controller"

export default async function productRoutes(app: FastifyInstance) {

  app.get("/products", getProducts)

  app.get("/products/:id", getProduct)

  app.get("/products/category/:category", getProductsCategory)

  app.post("/products", addProduct)

}