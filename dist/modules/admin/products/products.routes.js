"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = productRoutes;
const verifyAdminJWT_js_1 = require("../middleware/verifyAdminJWT.js");
const requirePermission_js_1 = require("../middleware/requirePermission.js");
const products_controller_js_1 = require("./products.controller.js");
async function productRoutes(fastify) {
    // GET /admin/products
    fastify.get('/products', {
        preHandler: [verifyAdminJWT_js_1.verifyAdminJWT, (0, requirePermission_js_1.requirePermission)('products:read')],
    }, products_controller_js_1.getProductsHandler);
    // GET /admin/products/:id
    fastify.get('/products/:id', {
        preHandler: [verifyAdminJWT_js_1.verifyAdminJWT, (0, requirePermission_js_1.requirePermission)('products:read')],
    }, products_controller_js_1.getProductHandler);
    // POST /admin/products
    fastify.post('/products', {
        preHandler: [verifyAdminJWT_js_1.verifyAdminJWT, (0, requirePermission_js_1.requirePermission)('products:write')],
    }, products_controller_js_1.createProductHandler);
    // PATCH /admin/products/:id
    fastify.patch('/products/:id', {
        preHandler: [verifyAdminJWT_js_1.verifyAdminJWT, (0, requirePermission_js_1.requirePermission)('products:write')],
    }, products_controller_js_1.updateProductHandler);
    // DELETE /admin/products/:id
    fastify.delete('/products/:id', {
        preHandler: [verifyAdminJWT_js_1.verifyAdminJWT, (0, requirePermission_js_1.requirePermission)('products:delete')],
    }, products_controller_js_1.deleteProductHandler);
    fastify.patch('/products/:id/sold-out', { preHandler: [verifyAdminJWT_js_1.verifyAdminJWT, (0, requirePermission_js_1.requirePermission)('products:write')] }, products_controller_js_1.toggleSoldOutHandler);
}
//# sourceMappingURL=products.routes.js.map