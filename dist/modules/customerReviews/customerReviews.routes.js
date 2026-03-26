"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = customerReviewsRoutes;
const customerReviews_controller_1 = require("./customerReviews.controller");
const customerReviews_schema_1 = require("./customerReviews.schema");
async function customerReviewsRoutes(app) {
    app.get("/reviews/customer", { ...customerReviews_schema_1.customerReviewsSchema }, customerReviews_controller_1.customerReviews);
}
