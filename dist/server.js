"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const auth_1 = require("./middleware/auth");
const products_routes_1 = __importDefault(require("./modules/products/products.routes"));
const cart_routes_1 = __importDefault(require("./modules/cart/cart.routes"));
const newArrivals_routes_1 = __importDefault(require("./modules/newArrivals/newArrivals.routes"));
const topSelling_routes_1 = __importDefault(require("./modules/topSelling/topSelling.routes"));
const customerReviews_routes_1 = __importDefault(require("./modules/customerReviews/customerReviews.routes"));
const redis_1 = require("./services/redis");
const app = (0, fastify_1.default)({
    logger: true,
});
/* CORS — must be registered before all routes */
app.register(cors_1.default, {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
});
/* Health Check */
app.get("/", async () => {
    return { status: "API running" };
});
/* Redis Test */
app.get("/redis-test", async () => {
    await redis_1.redis.set("hello", "world");
    const value = await redis_1.redis.get("hello");
    return { value };
});
/* Protected profile example */
app.get("/profile", { preHandler: auth_1.authMiddleware }, async (req) => {
    return {
        message: "Protected route",
        userId: req.userId,
    };
});
/* Public Routes */
app.register(auth_routes_1.default);
app.register(products_routes_1.default);
app.register(newArrivals_routes_1.default);
app.register(topSelling_routes_1.default);
app.register(customerReviews_routes_1.default);
/* Protected Routes */
app.register(async (protectedApp) => {
    protectedApp.addHook("preHandler", auth_1.authMiddleware);
    protectedApp.register(cart_routes_1.default);
});
const start = async () => {
    try {
        await app.listen({
            port: Number(process.env.PORT),
            host: "0.0.0.0",
        });
    }
    catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};
start();
