// src/modules/admin/orders/orders.schema.ts
import { z } from 'zod'

export const UpdateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    status: z.string(),
    label: z.string(),
  }),
})

export const OrderParamsSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
})

// Inferred types for controllers
export type OrderParams = { id: string }
export type UpdateOrderStatusBody = { status: string; label: string }