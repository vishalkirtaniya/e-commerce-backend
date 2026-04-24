import type { FastifyRequest, FastifyReply } from 'fastify'
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleSoldOut
} from './products.service.js'
import { auditLog } from '../shared/auditLog.js'
import {
  CreateProductSchema,
  UpdateProductSchema,
  ProductParamsSchema,
} from './products.schema.js'
import type { ProductParams, CreateProductBody, UpdateProductBody } from './products.schema.js'

export async function getProductsHandler(
  _request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const data = await getAllProducts()
    return reply.send(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return reply.code(500).send({ error: message })
  }
}

export async function getProductHandler(
  request: FastifyRequest<{ Params: ProductParams }>,
  reply: FastifyReply
) {
  const result = ProductParamsSchema.safeParse({ params: request.params })
  if (!result.success) {
    return reply.code(400).send({ error: result.error.flatten() })
  }

  try {
    const data = await getProductById(result.data.params.id)
    return reply.send(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    const code = message === 'Product not found' ? 404 : 500
    return reply.code(code).send({ error: message })
  }
}

export async function createProductHandler(
  request: FastifyRequest<{ Body: CreateProductBody }>,
  reply: FastifyReply
) {
  const result = CreateProductSchema.safeParse({ body: request.body })
  if (!result.success) {
    return reply.code(400).send({ error: result.error.flatten() })
  }

  try {
    const data = await createProduct(result.data.body)

    auditLog({
      adminUserId: request.admin.adminUserId,
      action: 'CREATE_PRODUCT',
      entity: 'products',
      entityId: data.id,
      payload: { name: data.name, sku: data.sku },
      ipAddress: request.ip,
    })

    return reply.code(201).send(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return reply.code(500).send({ error: message })
  }
}

export async function updateProductHandler(
  request: FastifyRequest<{ Params: ProductParams; Body: UpdateProductBody }>,
  reply: FastifyReply
) {
  const result = UpdateProductSchema.safeParse({
    params: request.params,
    body: request.body,
  })
  if (!result.success) {
    return reply.code(400).send({ error: result.error.flatten() })
  }

  try {
    const { id } = result.data.params
    const data = await updateProduct(id, result.data.body)

    auditLog({
      adminUserId: request.admin.adminUserId,
      action: 'UPDATE_PRODUCT',
      entity: 'products',
      entityId: id,
      payload: { updates: result.data.body },
      ipAddress: request.ip,
    })

    return reply.send(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    const code = message === 'Product not found' ? 404 : 500
    return reply.code(code).send({ error: message })
  }
}

export async function deleteProductHandler(
  request: FastifyRequest<{ Params: ProductParams }>,
  reply: FastifyReply
) {
  const result = ProductParamsSchema.safeParse({ params: request.params })
  if (!result.success) {
    return reply.code(400).send({ error: result.error.flatten() })
  }

  try {
    const { id } = result.data.params
    await deleteProduct(id)

    auditLog({
      adminUserId: request.admin.adminUserId,
      action: 'DELETE_PRODUCT',
      entity: 'products',
      entityId: id,
      ipAddress: request.ip,
    })

    return reply.code(204).send()
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return reply.code(500).send({ error: message })
  }
}

export async function toggleSoldOutHandler(
  request: FastifyRequest<{ Params: ProductParams; Body: { is_sold_out: boolean } }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params
    const { is_sold_out } = request.body
    const data = await toggleSoldOut(id, is_sold_out)

    auditLog({
      adminUserId: request.admin.adminUserId,
      action: is_sold_out ? 'MARK_SOLD_OUT' : 'MARK_IN_STOCK',
      entity: 'products',
      entityId: id,
      ipAddress: request.ip,
    })

    return reply.send(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return reply.code(500).send({ error: message })
  }
}