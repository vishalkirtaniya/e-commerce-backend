"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductsHandler = getProductsHandler;
exports.getFiltersHandler = getFiltersHandler;
exports.getProductBySlugHandler = getProductBySlugHandler;
const products_schema_1 = require("./products.schema");
const ProductsService = __importStar(require("./products.service"));
// ── GET /api/products ─────────────────────────────────────────
async function getProductsHandler(request, reply) {
    const parsed = products_schema_1.ProductsQuerySchema.safeParse(request.query);
    if (!parsed.success) {
        return reply.status(400).send({ error: parsed.error.flatten().fieldErrors });
    }
    try {
        const result = await ProductsService.getProducts(parsed.data);
        return reply.status(200).send(result);
    }
    catch (err) {
        request.log.error(err);
        return reply.status(500).send({ error: 'Failed to fetch products' });
    }
}
// ── GET /api/products/filters ─────────────────────────────────
// NOTE: must be registered BEFORE /:slug so it doesn't get swallowed
async function getFiltersHandler(_request, reply) {
    try {
        const result = await ProductsService.getFilterOptions();
        return reply.status(200).send(result);
    }
    catch (err) {
        _request.log.error(err);
        return reply.status(500).send({ error: 'Failed to fetch filter options' });
    }
}
// ── GET /api/products/:slug ───────────────────────────────────
async function getProductBySlugHandler(request, reply) {
    const { slug } = request.params;
    try {
        const product = await ProductsService.getProductBySlug(slug);
        if (!product) {
            return reply.status(404).send({ error: `Product '${slug}' not found` });
        }
        return reply.status(200).send(product);
    }
    catch (err) {
        request.log.error(err);
        return reply.status(500).send({ error: 'Failed to fetch product' });
    }
}
//# sourceMappingURL=products.controller.js.map