import type { FastifyInstance, RouteGenericInterface } from 'fastify'
import { verifyAdminJWT } from '../middleware/verifyAdminJWT.js'
import { requirePermission } from '../middleware/requirePermission.js'
import {
  uploadProductImage,
  getProductImages,
  setPrimaryImage,
  reorderImages,
  deleteProductImage,
} from './product-images.service.js'
import { auditLog } from '../shared/auditLog.js'

interface ProductParams { id: string }
interface ImageParams { id: string; imageId: string }
interface ReorderBody { orderedIds: number[] }

interface ProductParamsRoute extends RouteGenericInterface { Params: ProductParams }
interface ImageParamsRoute extends RouteGenericInterface { Params: ImageParams }
interface ReorderRoute extends RouteGenericInterface {
  Params: ProductParams
  Body: ReorderBody
}

export default async function productImageRoutes(
  fastify: FastifyInstance
): Promise<void> {

  // GET /admin/products/:id/images
  fastify.get<ProductParamsRoute>('/products/:id/images', {
    preHandler: [verifyAdminJWT, requirePermission('products:read')],
  }, async (request, reply) => {
    try {
      const data = await getProductImages(request.params.id)
      return reply.send(data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unexpected error'
      return reply.code(500).send({ error: message })
    }
  })

  // POST /admin/products/:id/images — multipart upload
  fastify.post<ProductParamsRoute>('/products/:id/images', {
    preHandler: [verifyAdminJWT, requirePermission('products:write')],
  }, async (request, reply) => {
    try {
      const data = await request.file()
      if (!data) return reply.code(400).send({ error: 'No file uploaded' })

      const buffer = await data.toBuffer()
      const mime = data.mimetype

      if (!['image/jpeg', 'image/png', 'image/webp'].includes(mime)) {
        return reply.code(400).send({ error: 'Only JPEG, PNG, WEBP allowed' })
      }

      if (buffer.length > 10 * 1024 * 1024) {
        return reply.code(400).send({ error: 'File too large — max 10MB' })
      }

      const image = await uploadProductImage(
        request.params.id,
        buffer,
        data.filename,
        mime
      )

      auditLog({
        adminUserId: request.admin.adminUserId,
        action: 'UPLOAD_PRODUCT_IMAGE',
        entity: 'product_images',
        entityId: request.params.id,
        ipAddress: request.ip,
      })

      return reply.code(201).send(image)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unexpected error'
      return reply.code(500).send({ error: message })
    }
  })

  // PATCH /admin/products/:id/images/reorder
  fastify.patch<ReorderRoute>('/products/:id/images/reorder', {
    preHandler: [verifyAdminJWT, requirePermission('products:write')],
  }, async (request, reply) => {
    try {
      await reorderImages(request.params.id, request.body.orderedIds)
      return reply.send({ success: true })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unexpected error'
      return reply.code(500).send({ error: message })
    }
  })

  // PATCH /admin/products/:id/images/:imageId/primary
  fastify.patch<ImageParamsRoute>('/products/:id/images/:imageId/primary', {
    preHandler: [verifyAdminJWT, requirePermission('products:write')],
  }, async (request, reply) => {
    try {
      const data = await setPrimaryImage(request.params.id, request.params.imageId)
      return reply.send(data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unexpected error'
      return reply.code(500).send({ error: message })
    }
  })

  // DELETE /admin/products/:id/images/:imageId
  fastify.delete<ImageParamsRoute>('/products/:id/images/:imageId', {
    preHandler: [verifyAdminJWT, requirePermission('products:write')],
  }, async (request, reply) => {
    try {
      await deleteProductImage(request.params.id, request.params.imageId)

      auditLog({
        adminUserId: request.admin.adminUserId,
        action: 'DELETE_PRODUCT_IMAGE',
        entity: 'product_images',
        entityId: request.params.imageId,
        ipAddress: request.ip,
      })

      return reply.code(204).send()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unexpected error'
      return reply.code(500).send({ error: message })
    }
  })
}