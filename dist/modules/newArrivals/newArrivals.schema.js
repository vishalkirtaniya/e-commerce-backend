"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewArrivalsQuerySchema = void 0;
const zod_1 = require("zod");
exports.NewArrivalsQuerySchema = zod_1.z.object({
    limit: zod_1.z.coerce.number().int().min(1).max(20).optional().default(8),
});
//# sourceMappingURL=newArrivals.schema.js.map