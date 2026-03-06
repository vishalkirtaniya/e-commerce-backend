import dotenv from "dotenv";
dotenv.config();

import Fastify from "fastify";
import authRoutes from "./modules/auth/auth.routes";
import { authMiddleware } from "./middleware/auth";
import productRoutes from "./modules/products/products.routes";
import cartRoutes from "./modules/cart/cart.routes";
import newArrivalsRoutes from "./modules/newArrivals/newArrivals.routes";
import topSellingRoutes from "./modules/topSelling/topSelling.routes";
import customerReviewsRoutes from "./modules/customerReviews/customerReviews.routes";
import { redis } from "./services/redis";

const app = Fastify({
  logger: true,
});

/* Health Check */
app.get("/", async () => {
  return { status: "API running" };
});

/* Redis Test */
app.get("/redis-test", async () => {
  await redis.set("hello", "world");
  const value = await redis.get("hello");
  return { value };
});

/* Protected profile example */
app.get("/profile", { preHandler: authMiddleware }, async (req: any) => {
  return {
    message: "Protected route",
    userId: req.userId,
  };
});

/* Public Routes */
app.register(authRoutes);
app.register(productRoutes);
app.register(newArrivalsRoutes);
app.register(topSellingRoutes);
app.register(customerReviewsRoutes);

/* Protected Routes */
app.register(async (protectedApp) => {
  protectedApp.addHook("preHandler", authMiddleware);
  protectedApp.register(cartRoutes);
});

const start = async () => {
  try {
    await app.listen({
      port: Number(process.env.PORT),
      host: "0.0.0.0",
    });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
