import type { FastifyRequest, FastifyReply } from "fastify";
import type { ProductParams, CreateProductBody, UpdateProductBody } from "./products.schema.js";
export declare function getProductsHandler(_request: FastifyRequest, reply: FastifyReply): Promise<never>;
export declare function getProductHandler(request: FastifyRequest<{
    Params: ProductParams;
}>, reply: FastifyReply): Promise<never>;
export declare function createProductHandler(request: FastifyRequest<{
    Body: CreateProductBody;
}>, reply: FastifyReply): Promise<never>;
export declare function updateProductHandler(request: FastifyRequest<{
    Params: ProductParams;
    Body: UpdateProductBody;
}>, reply: FastifyReply): Promise<never>;
export declare function deleteProductHandler(request: FastifyRequest<{
    Params: ProductParams;
}>, reply: FastifyReply): Promise<never>;
export declare function toggleSoldOutHandler(request: FastifyRequest<{
    Params: ProductParams;
    Body: {
        is_sold_out: boolean;
    };
}>, reply: FastifyReply): Promise<never>;
//# sourceMappingURL=products.controller.d.ts.map