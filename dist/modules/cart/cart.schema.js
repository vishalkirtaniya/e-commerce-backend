"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplyPromoSchema = exports.UpdateCartItemSchema = exports.AddToCartSchema = void 0;
const zod_1 = require("zod");
exports.AddToCartSchema = zod_1.z.object({
    product_id: zod_1.z.number().int().positive(),
    product_size_id: zod_1.z.number().int().positive().optional(),
    quantity: zod_1.z.number().int().min(1).max(99).optional().default(1),
    customization: zod_1.z.string().max(500).optional(),
});
exports.UpdateCartItemSchema = zod_1.z.object({
    quantity: zod_1.z.number().int().min(1).max(99),
});
exports.ApplyPromoSchema = zod_1.z.object({
    code: zod_1.z.string().min(1, "Promo code is required"),
});
//# sourceMappingURL=cart.schema.js.map