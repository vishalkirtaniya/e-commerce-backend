"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerReviewRoutes = customerReviewRoutes;
const auth_1 = require("../../middleware/auth");
const customerReviews_controller_1 = require("./customerReviews.controller");
async function customerReviewRoutes(fastify) {
    // GET /api/reviews?limit=6&featured=true
    fastify.get("/", customerReviews_controller_1.getReviewsHandler);
    // POST /api/reviews  (auth required)
    fastify.post("/", { preHandler: [auth_1.authenticate] }, customerReviews_controller_1.createReviewHandler);
}
//# sourceMappingURL=customerReviews.routes.js.map