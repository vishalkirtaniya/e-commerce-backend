"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.topSellingRoutes = topSellingRoutes;
const topSelling_controller_1 = require("./topSelling.controller");
async function topSellingRoutes(fastify) {
    // GET /api/top-selling?limit=8
    fastify.get("/", topSelling_controller_1.getTopSellingHandler);
}
//# sourceMappingURL=topSelling.routes.js.map