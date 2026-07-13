"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopSellingQuerySchema = void 0;
const zod_1 = require("zod");
exports.TopSellingQuerySchema = zod_1.z.object({
    limit: zod_1.z.coerce.number().int().min(1).max(20).optional().default(8),
});
//# sourceMappingURL=topSelling.schema.js.map