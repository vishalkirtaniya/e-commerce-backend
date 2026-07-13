"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductsHandler = getProductsHandler;
exports.getProductHandler = getProductHandler;
exports.createProductHandler = createProductHandler;
exports.updateProductHandler = updateProductHandler;
exports.deleteProductHandler = deleteProductHandler;
exports.toggleSoldOutHandler = toggleSoldOutHandler;
const products_service_js_1 = require("./products.service.js");
const auditLog_js_1 = require("../shared/auditLog.js");
const products_schema_js_1 = require("./products.schema.js");
async function getProductsHandler(_request, reply) {
    try {
        const data = await (0, products_service_js_1.getAllProducts)();
        return reply.send(data);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        return reply.code(500).send({ error: message });
    }
}
async function getProductHandler(request, reply) {
    const result = products_schema_js_1.ProductParamsSchema.safeParse({ params: request.params });
    if (!result.success) {
        return reply.code(400).send({ error: result.error.flatten() });
    }
    try {
        const data = await (0, products_service_js_1.getProductById)(result.data.params.id);
        return reply.send(data);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        const code = message === "Product not found" ? 404 : 500;
        return reply.code(code).send({ error: message });
    }
}
async function createProductHandler(request, reply) {
    const result = products_schema_js_1.CreateProductSchema.safeParse({ body: request.body });
    if (!result.success) {
        return reply.code(400).send({ error: result.error.flatten() });
    }
    try {
        const data = await (0, products_service_js_1.createProduct)(result.data.body);
        (0, auditLog_js_1.auditLog)({
            adminUserId: request.admin.adminUserId,
            action: "CREATE_PRODUCT",
            entity: "products",
            entityId: data.id,
            payload: { name: data.name, sku: data.sku },
            ipAddress: request.ip,
        });
        return reply.code(201).send(data);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        return reply.code(500).send({ error: message });
    }
}
async function updateProductHandler(request, reply) {
    const result = products_schema_js_1.UpdateProductSchema.safeParse({
        params: request.params,
        body: request.body,
    });
    if (!result.success) {
        return reply.code(400).send({ error: result.error.flatten() });
    }
    try {
        const { id } = result.data.params;
        const data = await (0, products_service_js_1.updateProduct)(id, result.data.body);
        (0, auditLog_js_1.auditLog)({
            adminUserId: request.admin.adminUserId,
            action: "UPDATE_PRODUCT",
            entity: "products",
            entityId: id,
            payload: { updates: result.data.body },
            ipAddress: request.ip,
        });
        return reply.send(data);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        const code = message === "Product not found" ? 404 : 500;
        return reply.code(code).send({ error: message });
    }
}
async function deleteProductHandler(request, reply) {
    const result = products_schema_js_1.ProductParamsSchema.safeParse({ params: request.params });
    if (!result.success) {
        return reply.code(400).send({ error: result.error.flatten() });
    }
    try {
        const { id } = result.data.params;
        const outcome = await (0, products_service_js_1.deleteProduct)(id);
        (0, auditLog_js_1.auditLog)({
            adminUserId: request.admin.adminUserId,
            action: outcome.archived ? "ARCHIVE_PRODUCT" : "DELETE_PRODUCT",
            entity: "products",
            entityId: id,
            ipAddress: request.ip,
        });
        // Return 200 with outcome instead of 204 so frontend knows what happened
        return reply.send(outcome);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        return reply.code(500).send({ error: message });
    }
}
async function toggleSoldOutHandler(request, reply) {
    try {
        const { id } = request.params;
        const { is_sold_out } = request.body;
        const data = await (0, products_service_js_1.toggleSoldOut)(id, is_sold_out);
        (0, auditLog_js_1.auditLog)({
            adminUserId: request.admin.adminUserId,
            action: is_sold_out ? "MARK_SOLD_OUT" : "MARK_IN_STOCK",
            entity: "products",
            entityId: id,
            ipAddress: request.ip,
        });
        return reply.send(data);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        return reply.code(500).send({ error: message });
    }
}
//# sourceMappingURL=products.controller.js.map