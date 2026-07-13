import type { FastifyInstance, RouteGenericInterface } from 'fastify'
import { verifyAdminJWT } from '../middleware/verifyAdminJWT.js'
import { requirePermission } from '../middleware/requirePermission.js'
import {
  getProductsHandler,
  getProductHandler,
  createProductHandler,
  updateProductHandler,
  deleteProductHandler,
  toggleSoldOutHandler
} from './products.controller.js'
import type { ProductParams, CreateProductBody, UpdateProductBody } from './products.schema.js'

interface ProductParamsRoute extends RouteGenericInterface {
  Params: ProductParams
}

interface CreateProductRoute extends RouteGenericInterface {
  Body: CreateProductBody
}

interface UpdateProductRoute extends RouteGenericInterface {
  Params: ProductParams
  Body: UpdateProductBody
}

export default async function productRoutes(fastify: FastifyInstance): Promise<void> {

  // GET /admin/products
  fastify.get('/products', {
    preHandler: [verifyAdminJWT, requirePermission('products:read')],
  }, getProductsHandler)

  // GET /admin/products/:id
  fastify.get<ProductParamsRoute>('/products/:id', {
    preHandler: [verifyAdminJWT, requirePermission('products:read')],
  }, getProductHandler)

  // POST /admin/products
  fastify.post<CreateProductRoute>('/products', {
    preHandler: [verifyAdminJWT, requirePermission('products:write')],
  }, createProductHandler)

  // PATCH /admin/products/:id
  fastify.patch<UpdateProductRoute>('/products/:id', {
    preHandler: [verifyAdminJWT, requirePermission('products:write')],
  }, updateProductHandler)

  // DELETE /admin/products/:id
  fastify.delete<ProductParamsRoute>('/products/:id', {
    preHandler: [verifyAdminJWT, requirePermission('products:delete')],
  }, deleteProductHandler)

  fastify.patch<{ Params: ProductParams; Body: { is_sold_out: boolean } }>(
  '/products/:id/sold-out',
  { preHandler: [verifyAdminJWT, requirePermission('products:write')] },
  toggleSoldOutHandler
)
}