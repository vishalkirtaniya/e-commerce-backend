// src/modules/admin/orders/orders.controller.ts
import type { FastifyRequest, FastifyReply } from 'fastify'
import { getAllOrders, getOrderStatus, updateOrderStatus } from './orders.service.js'
import { auditLog } from '../shared/auditLog.js'
import { UpdateOrderStatusSchema, OrderParamsSchema } from './orders.schema.js'
import type { OrderParams, UpdateOrderStatusBody } from './orders.schema.js'

export async function getOrdersHandler(
  _request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const data = await getAllOrders()
    return reply.send(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return reply.code(500).send({ error: message })
  }
}

export async function updateOrderStatusHandler(
  request: FastifyRequest<{ Params: OrderParams; Body: UpdateOrderStatusBody }>,
  reply: FastifyReply
) {
  const result = UpdateOrderStatusSchema.safeParse({
    params: request.params,
    body: request.body,
  })

  if (!result.success) {
    return reply.code(400).send({ error: result.error.flatten() })
  }

  try {
    const { id } = result.data.params
    const before = await getOrderStatus(id)
    const data = await updateOrderStatus(id, result.data.body)

    auditLog({
      adminUserId: request.admin.adminUserId,
      action: 'UPDATE_ORDER_STATUS',
      entity: 'orders',
      entityId: id,
      payload: { before: before?.status ?? null, after: result.data.body.status },
      ipAddress: request.ip,
    })

    return reply.send(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    const code = message === 'Order not found' ? 404 : 500
    return reply.code(code).send({ error: message })
  }
}

export async function refundOrderHandler(
  request: FastifyRequest<{ Params: OrderParams }>,
  reply: FastifyReply
) {
  const result = OrderParamsSchema.safeParse({ params: request.params })

  if (!result.success) {
    return reply.code(400).send({ error: result.error.flatten() })
  }

  try {
    const { id } = result.data.params

    // Your Razorpay refund logic here...

    auditLog({
      adminUserId: request.admin.adminUserId,
      action: 'PROCESS_REFUND',
      entity: 'orders',
      entityId: id,
      ipAddress: request.ip,
    })

    return reply.send({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return reply.code(500).send({ error: message })
  }
}