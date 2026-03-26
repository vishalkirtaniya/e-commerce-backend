"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerReviews = customerReviews;
const customerReviews_service_1 = require("./customerReviews.service");
async function customerReviews(req, reply) {
    try {
        const data = await (0, customerReviews_service_1.getCustomerReviews)();
        const reviews = data.map((r) => ({
            id: r.id,
            name: r.users?.name ?? "Anonymous",
            rating: parseFloat(r.rating),
            comment: r.comment ?? "",
            verified: r.verified,
        }));
        return reply.send(reviews);
    }
    catch (err) {
        req.log.error(err);
        return reply.status(500).send({ error: "Internal server error" });
    }
}
