"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTopSellingHandler = getTopSellingHandler;
const topSelling_schema_1 = require("./topSelling.schema");
const topSelling_service_1 = require("./topSelling.service");
// ── GET /api/top-selling ──────────────────────────────────────
async function getTopSellingHandler(request, reply) {
    const parsed = topSelling_schema_1.TopSellingQuerySchema.safeParse(request.query);
    if (!parsed.success) {
        return reply
            .status(400)
            .send({ error: parsed.error.flatten().fieldErrors });
    }
    try {
        const data = await (0, topSelling_service_1.getTopSelling)(parsed.data.limit);
        return reply.status(200).send({ data });
    }
    catch (err) {
        request.log.error(err);
        return reply
            .status(500)
            .send({ error: "Failed to fetch top selling products" });
    }
}
//# sourceMappingURL=topSelling.controller.js.map