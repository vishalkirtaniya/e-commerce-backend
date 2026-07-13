"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrdersHandler = getOrdersHandler;
exports.getOrderByIdHandler = getOrderByIdHandler;
exports.placeOrderHandler = placeOrderHandler;
const orders_schema_1 = require("./orders.schema");
const OrdersService = __importStar(require("./orders.service"));
// ── GET /api/orders ───────────────────────────────────────────
async function getOrdersHandler(request, reply) {
    const { userId } = request.user;
    try {
        const orders = await OrdersService.getOrders(userId);
        return reply.status(200).send({ data: orders });
    }
    catch (err) {
        request.log.error(err);
        return reply.status(500).send({ error: "Failed to fetch orders" });
    }
}
// ── GET /api/orders/:orderNumber ──────────────────────────────
async function getOrderByIdHandler(request, reply) {
    const { userId } = request.user;
    const { orderNumber } = request.params;
    try {
        const order = await OrdersService.getOrderById(userId, orderNumber);
        if (!order) {
            return reply
                .status(404)
                .send({ error: `Order '${orderNumber}' not found` });
        }
        return reply.status(200).send(order);
    }
    catch (err) {
        request.log.error(err);
        return reply.status(500).send({ error: "Failed to fetch order" });
    }
}
// ── POST /api/orders ──────────────────────────────────────────
async function placeOrderHandler(request, reply) {
    const parsed = orders_schema_1.PlaceOrderSchema.safeParse(request.body);
    if (!parsed.success) {
        return reply
            .status(400)
            .send({ error: parsed.error.flatten().fieldErrors });
    }
    const { userId } = request.user;
    try {
        const result = await OrdersService.placeOrder(userId, parsed.data);
        return reply.status(201).send(result);
    }
    catch (err) {
        request.log.error(err);
        return reply
            .status(err.statusCode ?? 500)
            .send({ error: err.message ?? "Failed to place order" });
    }
}
//# sourceMappingURL=orders.controller.js.map