"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRoutes = productRoutes;
const products_controller_1 = require("./products.controller");
async function productRoutes(fastify) {
    // GET /api/products?category=led-gifts&occasion=birthday&material=Acrylic&min_price=200&max_price=800&sort_by=price_asc&page=1&limit=12
    fastify.get('/', products_controller_1.getProductsHandler);
    // GET /api/products/filters  ← must be before /:slug
    fastify.get('/filters', products_controller_1.getFiltersHandler);
    // GET /api/products/led-spotify-stc-01
    fastify.get('/:slug', products_controller_1.getProductBySlugHandler);
}
//# sourceMappingURL=products.routes.js.map