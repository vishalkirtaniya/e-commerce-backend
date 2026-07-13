"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReviewsHandler = getReviewsHandler;
exports.createReviewHandler = createReviewHandler;
const customerReviews_schema_1 = require("./customerReviews.schema");
const ReviewsService = __importStar(require("./customerReviews.service"));
// ── GET /api/reviews ──────────────────────────────────────────
async function getReviewsHandler(request, reply) {
    const parsed = customerReviews_schema_1.ReviewsQuerySchema.safeParse(request.query);
    if (!parsed.success) {
        return reply.status(400).send({ error: parsed.error.flatten().fieldErrors });
    }
    try {
        const data = await ReviewsService.getReviews(parsed.data);
        return reply.status(200).send({ data });
    }
    catch (err) {
        request.log.error(err);
        return reply.status(500).send({ error: 'Failed to fetch reviews' });
    }
}
// ── POST /api/reviews ─────────────────────────────────────────
async function createReviewHandler(request, reply) {
    const parsed = customerReviews_schema_1.CreateReviewSchema.safeParse(request.body);
    if (!parsed.success) {
        return reply.status(400).send({ error: parsed.error.flatten().fieldErrors });
    }
    const userId = request.user.userId;
    try {
        const review = await ReviewsService.createReview(parsed.data, userId);
        return reply.status(201).send(review);
    }
    catch (err) {
        request.log.error(err);
        return reply.status(err.statusCode ?? 500).send({ error: err.message ?? 'Failed to create review' });
    }
}
//# sourceMappingURL=customerReviews.controller.js.map