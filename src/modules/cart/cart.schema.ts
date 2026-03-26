import { z } from "zod";

export const AddToCartSchema = z.object({
  product_id: z.number().int().positive(),
  product_size_id: z.number().int().positive().optional(),
  quantity: z.number().int().min(1).max(99).optional().default(1),
  customization: z.string().max(500).optional(),
});

export const UpdateCartItemSchema = z.object({
  quantity: z.number().int().min(1).max(99),
});

export const ApplyPromoSchema = z.object({
  code: z.string().min(1, "Promo code is required"),
});

export type AddToCartInput = z.infer<typeof AddToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof UpdateCartItemSchema>;
export type ApplyPromoInput = z.infer<typeof ApplyPromoSchema>;
