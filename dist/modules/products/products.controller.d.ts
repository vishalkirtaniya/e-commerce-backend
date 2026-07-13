import { FastifyRequest, FastifyReply } from 'fastify';
export declare function getProductsHandler(request: FastifyRequest, reply: FastifyReply): Promise<never>;
export declare function getFiltersHandler(_request: FastifyRequest, reply: FastifyReply): Promise<never>;
export declare function getProductBySlugHandler(request: FastifyRequest<{
    Params: {
        slug: string;
    };
}>, reply: FastifyReply): Promise<never>;
//# sourceMappingURL=products.controller.d.ts.map