"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNewArrivals = getNewArrivals;
const prisma_1 = require("../../services/prisma");
async function getNewArrivals() {
    return prisma_1.prisma.product.findMany({
        orderBy: { createdAt: "desc" },
        take: 4
    });
}
