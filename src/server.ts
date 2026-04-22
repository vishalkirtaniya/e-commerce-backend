import Fastify from "fastify";
import dns from "dns";
import dotenv from "dotenv";
import path from "path";

// Load .env immediately — before any other module reads process.env
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

dns.setDefaultResultOrder("ipv4first");

import { registerPlugins } from "./plugins/index";
import { authRoutes } from "./modules/auth/auth.routes";
import { productRoutes } from "./modules/products/products.routes";
import { newArrivalsRoutes } from "./modules/newArrivals/newArrivals.routes";
import { topSellingRoutes } from "./modules/topSelling/topSelling.routes";
import { customerReviewRoutes } from "./modules/customerReviews/customerReviews.routes";
import { cartRoutes } from "./modules/cart/cart.routes";
import { orderRoutes } from "./modules/orders/order.routes";
import { paymentRoutes } from "./modules/payments/payments.routes";
import adminRoutes from './modules/admin/admin.routes.js'
import redis from "./services/redis";
import pool from "./services/db";

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
  await registerPlugins(fastify);

  fastify.register(authRoutes, { prefix: "/api/auth" });
  fastify.register(productRoutes, { prefix: "/api/products" });
  fastify.register(newArrivalsRoutes, { prefix: "/api/new-arrivals" });
  fastify.register(topSellingRoutes, { prefix: "/api/top-selling" });
  fastify.register(customerReviewRoutes, { prefix: "/api/reviews" });
  fastify.register(cartRoutes, { prefix: "/api/cart" });
  fastify.register(orderRoutes, { prefix: "/api/orders" });
  fastify.register(paymentRoutes, { prefix: "/api/payments" });
  fastify.register(adminRoutes, { prefix: "/admin"})

  fastify.get("/health", async () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }));

  const port = Number(process.env.PORT) || 5000;
  await fastify.listen({ port, host: "0.0.0.0" });
  console.log(`🚀 Server running at http://localhost:${port}`);
}

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
