"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTopSellingProducts = getTopSellingProducts;
const prisma_1 = require("../../services/prisma");
async function getTopSellingProducts() {
    const orderItems = await prisma_1.prisma.orderItem.findMany({
        include: {
            product: true
        }
    });
    const totals = new Map();
    for (const item of orderItems) {
        if (!item.product)
            continue;
        const pid = item.product.id;
        if (totals.has(pid)) {
            totals.get(pid).totalSold += item.quantity;
        }
        else {
            totals.set(pid, { product: item.product, totalSold: item.quantity });
        }
    }
    return Array.from(totals.values())
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, 4)
        .map((entry) => entry.product);
}
