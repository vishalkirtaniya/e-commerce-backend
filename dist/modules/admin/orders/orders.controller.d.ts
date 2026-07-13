import type { FastifyRequest, FastifyReply } from 'fastify';
import type { OrderParams, UpdateOrderStatusBody } from './orders.schema.js';
export declare function getOrdersHandler(_request: FastifyRequest, reply: FastifyReply): Promise<never>;
export declare function updateOrderStatusHandler(request: FastifyRequest<{
    Params: OrderParams;
    Body: UpdateOrderStatusBody;
}>, reply: FastifyReply): Promise<never>;
export declare function refundOrderHandler(request: FastifyRequest<{
    Params: OrderParams;
}>, reply: FastifyReply): Promise<never>;
//# sourceMappingURL=orders.controller.d.ts.map