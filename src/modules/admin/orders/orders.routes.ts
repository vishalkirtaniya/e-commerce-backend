// src/modules/admin/orders/orders.routes.ts
import type { FastifyInstance, RouteGenericInterface } from "fastify";
import { verifyAdminJWT } from "../middleware/verifyAdminJWT.js";
import { requirePermission } from "../middleware/requirePermission.js";
import {
  getOrdersHandler,
  updateOrderStatusHandler,
  refundOrderHandler,
} from "./orders.controller.js";
import type { OrderParams, UpdateOrderStatusBody } from "./orders.schema.js";

interface UpdateStatusRoute extends RouteGenericInterface {
  Params: OrderParams;
  Body: UpdateOrderStatusBody;
}

interface OrderParamsRoute extends RouteGenericInterface {
  Params: OrderParams;
}

export default async function orderRoutes(
  fastify: FastifyInstance,
): Promise<void> {
  fastify.get(
    "/orders",
    {
      preHandler: [verifyAdminJWT, requirePermission("orders:read")],
    },
    getOrdersHandler,
  );

  fastify.patch<UpdateStatusRoute>(
    "/orders/:id/status",
    {
      preHandler: [verifyAdminJWT, requirePermission("orders:write")],
    },
    updateOrderStatusHandler,
  );

  fastify.post<OrderParamsRoute>(
    "/orders/:id/refund",
    {
      preHandler: [verifyAdminJWT, requirePermission("orders:refund")],
    },
    refundOrderHandler,
  );
}
