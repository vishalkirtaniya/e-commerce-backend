import { z } from "zod"

export const createProductSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  originalPrice: z.number().optional(),
  image: z.string().url(),
  imageUrl: z.string().url().optional(),
  category: z.string().optional(),
  stock: z.number().int().min(0).default(0),
  rating: z.number().min(0).max(5).default(0),
  numReviews: z.number().int().min(0).default(0),
  discount: z.number().int().min(0).max(100).optional()
})

export const updateProductSchema = createProductSchema.partial()

export const productIdSchema = z.object({
  id: z.string().uuid()
})
