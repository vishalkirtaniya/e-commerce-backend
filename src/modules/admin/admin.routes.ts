import type { FastifyInstance } from "fastify";
import orderRoutes from "./orders/orders.routes";
import productRoutes from "./products/products.routes";
import meRoutes from "./me/me.routes";
import adminUserRoutes from "./users/admin-users.routes";
import adminAuthRoutes from "./auth/admin-auth.routes.js";
import productImageRoutes from "./product-images/product-images.routes";
import categoryRoutes from "./categories/categories.routes";
import materialRoutes from "./materials/materials.routes";

export default async function adminRoutes(
  fastify: FastifyInstance,
): Promise<void> {
  fastify.register(orderRoutes);
  fastify.register(productRoutes);
  fastify.register(meRoutes);
  fastify.register(adminUserRoutes);
  fastify.register(adminAuthRoutes);
  fastify.register(productImageRoutes);
  fastify.register(categoryRoutes);
  fastify.register(materialRoutes);
  // future: fastify.register(userRoutes)
  // future: fastify.register(analyticsRoutes)
}
