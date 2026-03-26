"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomerReviews = getCustomerReviews;
const prisma_1 = require("../../services/prisma");
async function getCustomerReviews() {
    return prisma_1.prisma.review.findMany({
        where: { rating: { gte: 4 } },
        include: {
            user: {
                select: { name: true }
            }
        },
        orderBy: { createdAt: "desc" },
        take: 3
    });
}
