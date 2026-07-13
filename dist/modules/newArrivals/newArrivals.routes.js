"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newArrivalsRoutes = newArrivalsRoutes;
const newArrivals_controller_1 = require("./newArrivals.controller");
async function newArrivalsRoutes(fastify) {
    // GET /api/new-arrivals?limit=8
    fastify.get('/', newArrivals_controller_1.getNewArrivalsHandler);
}
//# sourceMappingURL=newArrivals.routes.js.map