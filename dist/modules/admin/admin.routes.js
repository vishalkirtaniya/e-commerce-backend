"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = adminRoutes;
const orders_routes_1 = __importDefault(require("./orders/orders.routes"));
const products_routes_1 = __importDefault(require("./products/products.routes"));
const me_routes_1 = __importDefault(require("./me/me.routes"));
const admin_users_routes_1 = __importDefault(require("./users/admin-users.routes"));
const admin_auth_routes_js_1 = __importDefault(require("./auth/admin-auth.routes.js"));
const product_images_routes_1 = __importDefault(require("./product-images/product-images.routes"));
const categories_routes_1 = __importDefault(require("./categories/categories.routes"));
const materials_routes_1 = __importDefault(require("./materials/materials.routes"));
const customers_routes_1 = __importDefault(require("./customers/customers.routes"));
const analytics_routes_1 = __importDefault(require("./analytics/analytics.routes"));
const promos_routes_1 = __importDefault(require("./promos/promos.routes"));
async function adminRoutes(fastify) {
    fastify.register(orders_routes_1.default);
    fastify.register(products_routes_1.default);
    fastify.register(me_routes_1.default);
    fastify.register(admin_users_routes_1.default);
    fastify.register(admin_auth_routes_js_1.default);
    fastify.register(product_images_routes_1.default);
    fastify.register(categories_routes_1.default);
    fastify.register(materials_routes_1.default);
    fastify.register(customers_routes_1.default);
    fastify.register(analytics_routes_1.default);
    fastify.register(promos_routes_1.default);
    // future: fastify.register(userRoutes)
    // future: fastify.register(analyticsRoutes)
}
//# sourceMappingURL=admin.routes.js.map