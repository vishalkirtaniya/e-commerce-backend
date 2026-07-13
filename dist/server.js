"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const dns_1 = __importDefault(require("dns"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load .env immediately — before any other module reads process.env
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), ".env") });
dns_1.default.setDefaultResultOrder("ipv4first");
const index_1 = require("./plugins/index");
const auth_routes_1 = require("./modules/auth/auth.routes");
const products_routes_1 = require("./modules/products/products.routes");
const newArrivals_routes_1 = require("./modules/newArrivals/newArrivals.routes");
const topSelling_routes_1 = require("./modules/topSelling/topSelling.routes");
const customerReviews_routes_1 = require("./modules/customerReviews/customerReviews.routes");
const cart_routes_1 = require("./modules/cart/cart.routes");
const order_routes_1 = require("./modules/orders/order.routes");
const payments_routes_1 = require("./modules/payments/payments.routes");
const admin_routes_1 = __importDefault(require("./modules/admin/admin.routes"));
const search_routes_1 = __importDefault(require("./modules/search/search.routes"));
const redis_1 = __importDefault(require("./services/redis"));
const db_1 = __importDefault(require("./services/db"));
console.log(process.env.DATABASE_URL);
const fastify = (0, fastify_1.default)({
    logger: {
        level: process.env.NODE_ENV === "production" ? "warn" : "info",
        transport: process.env.NODE_ENV !== "production"
            ? { target: "pino-pretty", options: { colorize: true } }
            : undefined,
    },
});
async function bootstrap() {
    await (0, index_1.registerPlugins)(fastify);
    fastify.register(auth_routes_1.authRoutes, { prefix: "/api/auth" });
    fastify.register(products_routes_1.productRoutes, { prefix: "/api/products" });
    fastify.register(newArrivals_routes_1.newArrivalsRoutes, { prefix: "/api/new-arrivals" });
    fastify.register(topSelling_routes_1.topSellingRoutes, { prefix: "/api/top-selling" });
    fastify.register(customerReviews_routes_1.customerReviewRoutes, { prefix: "/api/reviews" });
    fastify.register(cart_routes_1.cartRoutes, { prefix: "/api/cart" });
    fastify.register(order_routes_1.orderRoutes, { prefix: "/api/orders" });
    fastify.register(payments_routes_1.paymentRoutes, { prefix: "/api/payments" });
    fastify.register(admin_routes_1.default, { prefix: "/admin" });
    fastify.register(search_routes_1.default, { prefix: "/api" });
    fastify.get("/health", async () => ({
        status: "ok",
        timestamp: new Date().toISOString(),
    }));
    const port = Number(process.env.PORT) || 5000;
    await fastify.listen({ port, host: "0.0.0.0" });
    console.log(`🚀 Server running at http://localhost:${port}`);
    fastify.ready(() => {
        console.log(fastify.printRoutes());
    });
}
const shutdown = async () => {
    console.log("\n🔄 Shutting down gracefully...");
    await fastify.close();
    await db_1.default.end();
    await redis_1.default.quit();
    console.log("✅ All connections closed");
    process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
bootstrap().catch((err) => {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
});
//# sourceMappingURL=server.js.map