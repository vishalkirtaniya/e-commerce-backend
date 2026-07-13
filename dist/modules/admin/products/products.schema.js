"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductParamsSchema = exports.UpdateProductSchema = exports.CreateProductSchema = void 0;
const zod_1 = require("zod");
const ProductSizeSchema = zod_1.z.object({
    label: zod_1.z.string().min(1),
    price: zod_1.z.number().positive(),
    is_default: zod_1.z.boolean().optional().default(false),
});
exports.CreateProductSchema = zod_1.z.object({
    body: zod_1.z.object({
        sku: zod_1.z.string().min(1),
        slug: zod_1.z.string().min(1),
        name: zod_1.z.string().min(1),
        description: zod_1.z.string().optional(),
        material: zod_1.z.string().min(1),
        price: zod_1.z.number().positive(),
        original_price: zod_1.z.number().positive().optional(),
        discount: zod_1.z.number().min(0).max(100).optional(),
        category_id: zod_1.z.number().int().positive(),
        is_new_arrival: zod_1.z.boolean().optional().default(false),
        is_top_selling: zod_1.z.boolean().optional().default(false),
        is_customizable: zod_1.z.boolean().optional().default(true),
        is_customizable_with_image: zod_1.z.boolean().optional().default(false), // ← new
        is_sold_out: zod_1.z.boolean().optional().default(false),
        sizes: zod_1.z.array(ProductSizeSchema).optional().default([]),
    }),
});
exports.UpdateProductSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string(),
    }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).optional(),
        description: zod_1.z.string().optional(),
        price: zod_1.z.number().positive().optional(),
        original_price: zod_1.z.number().positive().optional(),
        discount: zod_1.z.number().min(0).max(100).optional(),
        is_new_arrival: zod_1.z.boolean().optional(),
        is_top_selling: zod_1.z.boolean().optional(),
        is_customizable: zod_1.z.boolean().optional(),
        is_customizable_with_image: zod_1.z.boolean().optional(), // ← new
        is_sold_out: zod_1.z.boolean().optional(),
        sizes: zod_1.z.array(ProductSizeSchema).optional(),
    }),
});
exports.ProductParamsSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string(),
    }),
});
//# sourceMappingURL=products.schema.js.map