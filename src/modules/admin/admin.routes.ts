import type { FastifyInstance } from "fastify";
import orderRoutes from "./orders/orders.routes";
import productRoutes from "./products/products.routes";
import meRoutes from "./me/me.routes";
import adminUserRoutes from "./users/admin-users.routes";
import adminAuthRoutes from "./auth/admin-auth.routes.js";
import productImageRoutes from "./product-images/product-images.routes";
import categoryRoutes from "./categories/categories.routes";
import materialRoutes from "./materials/materials.routes";
import customerRoutes from "./customers/customers.routes";
import analyticsRoutes from "./analytics/analytics.routes";
import promoRoutes from "./promos/promos.routes";

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
  fastify.register(customerRoutes)
  fastify.register(analyticsRoutes)
  fastify.register(promoRoutes)
  // future: fastify.register(userRoutes)
  // future: fastify.register(analyticsRoutes)
}
