"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = productImageRoutes;
const verifyAdminJWT_js_1 = require("../middleware/verifyAdminJWT.js");
const requirePermission_js_1 = require("../middleware/requirePermission.js");
const product_images_service_js_1 = require("./product-images.service.js");
const auditLog_js_1 = require("../shared/auditLog.js");
async function productImageRoutes(fastify) {
    // GET /admin/products/:id/images
    fastify.get('/products/:id/images', {
        preHandler: [verifyAdminJWT_js_1.verifyAdminJWT, (0, requirePermission_js_1.requirePermission)('products:read')],
    }, async (request, reply) => {
        try {
            const data = await (0, product_images_service_js_1.getProductImages)(request.params.id);
            return reply.send(data);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Unexpected error';
            return reply.code(500).send({ error: message });
        }
    });
    // POST /admin/products/:id/images — multipart upload
    fastify.post('/products/:id/images', {
        preHandler: [verifyAdminJWT_js_1.verifyAdminJWT, (0, requirePermission_js_1.requirePermission)('products:write')],
    }, async (request, reply) => {
        try {
            const data = await request.file();
            if (!data)
                return reply.code(400).send({ error: 'No file uploaded' });
            const buffer = await data.toBuffer();
            const mime = data.mimetype;
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(mime)) {
                return reply.code(400).send({ error: 'Only JPEG, PNG, WEBP allowed' });
            }
            if (buffer.length > 10 * 1024 * 1024) {
                return reply.code(400).send({ error: 'File too large — max 10MB' });
            }
            const image = await (0, product_images_service_js_1.uploadProductImage)(request.params.id, buffer, data.filename, mime);
            (0, auditLog_js_1.auditLog)({
                adminUserId: request.admin.adminUserId,
                action: 'UPLOAD_PRODUCT_IMAGE',
                entity: 'product_images',
                entityId: request.params.id,
                ipAddress: request.ip,
            });
            return reply.code(201).send(image);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Unexpected error';
            return reply.code(500).send({ error: message });
        }
    });
    // PATCH /admin/products/:id/images/reorder
    fastify.patch('/products/:id/images/reorder', {
        preHandler: [verifyAdminJWT_js_1.verifyAdminJWT, (0, requirePermission_js_1.requirePermission)('products:write')],
    }, async (request, reply) => {
        try {
            await (0, product_images_service_js_1.reorderImages)(request.params.id, request.body.orderedIds);
            return reply.send({ success: true });
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Unexpected error';
            return reply.code(500).send({ error: message });
        }
    });
    // PATCH /admin/products/:id/images/:imageId/primary
    fastify.patch('/products/:id/images/:imageId/primary', {
        preHandler: [verifyAdminJWT_js_1.verifyAdminJWT, (0, requirePermission_js_1.requirePermission)('products:write')],
    }, async (request, reply) => {
        try {
            const data = await (0, product_images_service_js_1.setPrimaryImage)(request.params.id, request.params.imageId);
            return reply.send(data);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Unexpected error';
            return reply.code(500).send({ error: message });
        }
    });
    // DELETE /admin/products/:id/images/:imageId
    fastify.delete('/products/:id/images/:imageId', {
        preHandler: [verifyAdminJWT_js_1.verifyAdminJWT, (0, requirePermission_js_1.requirePermission)('products:write')],
    }, async (request, reply) => {
        try {
            await (0, product_images_service_js_1.deleteProductImage)(request.params.id, request.params.imageId);
            (0, auditLog_js_1.auditLog)({
                adminUserId: request.admin.adminUserId,
                action: 'DELETE_PRODUCT_IMAGE',
                entity: 'product_images',
                entityId: request.params.imageId,
                ipAddress: request.ip,
            });
            return reply.code(204).send();
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Unexpected error';
            return reply.code(500).send({ error: message });
        }
    });
}
//# sourceMappingURL=product-images.routes.js.map