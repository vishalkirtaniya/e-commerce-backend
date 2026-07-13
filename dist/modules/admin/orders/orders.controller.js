"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrdersHandler = getOrdersHandler;
exports.updateOrderStatusHandler = updateOrderStatusHandler;
exports.refundOrderHandler = refundOrderHandler;
const orders_service_js_1 = require("./orders.service.js");
const auditLog_js_1 = require("../shared/auditLog.js");
const orders_schema_js_1 = require("./orders.schema.js");
async function getOrdersHandler(_request, reply) {
    try {
        const data = await (0, orders_service_js_1.getAllOrders)();
        return reply.send(data);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Unexpected error';
        return reply.code(500).send({ error: message });
    }
}
async function updateOrderStatusHandler(request, reply) {
    const result = orders_schema_js_1.UpdateOrderStatusSchema.safeParse({
        params: request.params,
        body: request.body,
    });
    if (!result.success) {
        return reply.code(400).send({ error: result.error.flatten() });
    }
    try {
        const { id } = result.data.params;
        const before = await (0, orders_service_js_1.getOrderStatus)(id);
        const data = await (0, orders_service_js_1.updateOrderStatus)(id, result.data.body);
        (0, auditLog_js_1.auditLog)({
            adminUserId: request.admin.adminUserId,
            action: 'UPDATE_ORDER_STATUS',
            entity: 'orders',
            entityId: id,
            payload: { before: before?.status ?? null, after: result.data.body.status },
            ipAddress: request.ip,
        });
        return reply.send(data);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Unexpected error';
        const code = message === 'Order not found' ? 404 : 500;
        return reply.code(code).send({ error: message });
    }
}
async function refundOrderHandler(request, reply) {
    const result = orders_schema_js_1.OrderParamsSchema.safeParse({ params: request.params });
    if (!result.success) {
        return reply.code(400).send({ error: result.error.flatten() });
    }
    try {
        const { id } = result.data.params;
        // Your Razorpay refund logic here...
        (0, auditLog_js_1.auditLog)({
            adminUserId: request.admin.adminUserId,
            action: 'PROCESS_REFUND',
            entity: 'orders',
            entityId: id,
            ipAddress: request.ip,
        });
        return reply.send({ success: true });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Unexpected error';
        return reply.code(500).send({ error: message });
    }
}
//# sourceMappingURL=orders.controller.js.map