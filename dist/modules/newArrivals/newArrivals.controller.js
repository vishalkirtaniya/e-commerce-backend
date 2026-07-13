"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNewArrivalsHandler = getNewArrivalsHandler;
const newArrivals_schema_1 = require("./newArrivals.schema");
const newArrivals_service_1 = require("./newArrivals.service");
// ── GET /api/new-arrivals ─────────────────────────────────────
async function getNewArrivalsHandler(request, reply) {
    const parsed = newArrivals_schema_1.NewArrivalsQuerySchema.safeParse(request.query);
    if (!parsed.success) {
        return reply.status(400).send({ error: parsed.error.flatten().fieldErrors });
    }
    try {
        const data = await (0, newArrivals_service_1.getNewArrivals)(parsed.data.limit);
        return reply.status(200).send({ data });
    }
    catch (err) {
        request.log.error(err);
        return reply.status(500).send({ error: 'Failed to fetch new arrivals' });
    }
}
//# sourceMappingURL=newArrivals.controller.js.map