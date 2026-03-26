import Fastify from "fastify";
import dotenv from "dotenv";
import { registerPlugins } from "./plugins/index";
import { authRoutes } from "./modules/auth/auth.routes";
import { productRoutes } from "./modules/products/products.routes";
import { newArrivalsRoutes } from "./modules/newArrivals/newArrivals.routes";
import { topSellingRoutes } from "./modules/topSelling/topSelling.routes";
import { customerReviewRoutes } from "./modules/customerReviews/customerReviews.routes";
import { cartRoutes } from "./modules/cart/cart.routes";
import { orderRoutes } from "./modules/orders/order.routes";
import { paymentRoutes } from "./modules/payments/payments.routes";
import redis from "./services/redis";
import pool from "./services/db";

dotenv.config();

const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === "production" ? "warn" : "info",
    transport:
      process.env.NODE_ENV !== "production"
        ? { target: "pino-pretty", options: { colorize: true } }
        : undefined,
  },
});

async function bootstrap() {
  // 1. Register plugins (cors, etc.)
  await registerPlugins(fastify);

  // 2. Register all route modules under /api
  fastify.register(authRoutes, { prefix: "/api/auth" });
  fastify.register(productRoutes, { prefix: "/api/products" });
  fastify.register(newArrivalsRoutes, { prefix: "/api/new-arrivals" });
  fastify.register(topSellingRoutes, { prefix: "/api/top-selling" });
  fastify.register(customerReviewRoutes, { prefix: "/api/reviews" });
  fastify.register(cartRoutes, { prefix: "/api/cart" });
  fastify.register(orderRoutes, { prefix: "/api/orders" });
  fastify.register(paymentRoutes, { prefix: "/api/payments" });

  // 3. Health check
  fastify.get("/health", async () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }));

  // 4. Start server
  const port = Number(process.env.PORT) || 3000;
  await fastify.listen({ port, host: "0.0.0.0" });
  console.log(`🚀 Server running at http://localhost:${port}`);
}

// Graceful shutdown
const shutdown = async () => {
  console.log("\n🔄 Shutting down gracefully...");
  await fastify.close();
  await pool.end();
  await redis.quit();
  console.log("✅ All connections closed");
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

bootstrap().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});
