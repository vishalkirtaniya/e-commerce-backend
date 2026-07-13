import { FastifyRequest, FastifyReply } from "fastify";
export declare function getCartHandler(request: FastifyRequest, reply: FastifyReply): Promise<never>;
export declare function addToCartHandler(request: FastifyRequest, reply: FastifyReply): Promise<never>;
export declare function updateCartItemHandler(request: FastifyRequest<{
    Params: {
        itemId: string;
    };
}>, reply: FastifyReply): Promise<never>;
export declare function removeCartItemHandler(request: FastifyRequest<{
    Params: {
        itemId: string;
    };
}>, reply: FastifyReply): Promise<never>;
export declare function clearCartHandler(request: FastifyRequest, reply: FastifyReply): Promise<never>;
export declare function applyPromoHandler(request: FastifyRequest, reply: FastifyReply): Promise<never>;
export declare function removePromoHandler(request: FastifyRequest, reply: FastifyReply): Promise<never>;
//# sourceMappingURL=cart.controller.d.ts.map