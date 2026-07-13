"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderParamsSchema = exports.UpdateOrderStatusSchema = void 0;
// src/modules/admin/orders/orders.schema.ts
const zod_1 = require("zod");
exports.UpdateOrderStatusSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string(),
    }),
    body: zod_1.z.object({
        status: zod_1.z.string(),
        label: zod_1.z.string(),
    }),
});
exports.OrderParamsSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string(),
    }),
});
//# sourceMappingURL=orders.schema.js.map