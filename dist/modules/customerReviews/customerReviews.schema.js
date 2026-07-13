"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateReviewSchema = exports.ReviewsQuerySchema = void 0;
const zod_1 = require("zod");
exports.ReviewsQuerySchema = zod_1.z.object({
    limit: zod_1.z.coerce.number().int().min(1).max(20).optional().default(6),
    featured: zod_1.z.enum(['true', 'false']).optional().default('true'),
});
exports.CreateReviewSchema = zod_1.z.object({
    product_id: zod_1.z.number().int().positive(),
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    rating: zod_1.z.number().int().min(1).max(5),
    comment: zod_1.z.string().min(5, 'Comment must be at least 5 characters').optional(),
});
//# sourceMappingURL=customerReviews.schema.js.map