import { FastifyRequest, FastifyReply } from "fastify";
export declare function getOrdersHandler(request: FastifyRequest, reply: FastifyReply): Promise<never>;
export declare function getOrderByIdHandler(request: FastifyRequest<{
    Params: {
        orderNumber: string;
    };
}>, reply: FastifyReply): Promise<never>;
export declare function placeOrderHandler(request: FastifyRequest, reply: FastifyReply): Promise<never>;
//# sourceMappingURL=orders.controller.d.ts.map