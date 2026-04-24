import { z } from 'zod'

export const CreateProductSchema = z.object({
  body: z.object({
    sku: z.string().min(1),
    slug: z.string().min(1),
    name: z.string().min(1),
    description: z.string().optional(),
    material: z.string().min(1),
    price: z.number().positive(),
    original_price: z.number().positive().optional(),
    discount: z.number().min(0).max(100).optional(),
    category_id: z.number().int().positive(),
    is_new_arrival: z.boolean().optional().default(false),
    is_top_selling: z.boolean().optional().default(false),
    is_customizable: z.boolean().optional().default(true),
  }),
})

export const UpdateProductSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    price: z.number().positive().optional(),
    original_price: z.number().positive().optional(),
    discount: z.number().min(0).max(100).optional(),
    is_new_arrival: z.boolean().optional(),
    is_top_selling: z.boolean().optional(),
    is_customizable: z.boolean().optional(),
  }),
})

export const ProductParamsSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
})

// Inferred types
export type ProductParams = { id: string }
export type CreateProductBody = z.infer<typeof CreateProductSchema>['body']
export type UpdateProductBody = z.infer<typeof UpdateProductSchema>['body']