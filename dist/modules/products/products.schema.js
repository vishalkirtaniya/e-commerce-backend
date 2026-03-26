"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productIdSchema = exports.updateProductSchema = exports.createProductSchema = void 0;
const zod_1 = require("zod");
exports.createProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    slug: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    price: zod_1.z.number().positive(),
    originalPrice: zod_1.z.number().optional(),
    image: zod_1.z.string().url(),
    imageUrl: zod_1.z.string().url().optional(),
    category: zod_1.z.string().optional(),
    stock: zod_1.z.number().int().min(0).default(0),
    rating: zod_1.z.number().min(0).max(5).default(0),
    numReviews: zod_1.z.number().int().min(0).default(0),
    discount: zod_1.z.number().int().min(0).max(100).optional()
});
exports.updateProductSchema = exports.createProductSchema.partial();
exports.productIdSchema = zod_1.z.object({
    id: zod_1.z.string().uuid()
});
