import type { UpdateOrderStatusBody } from "./orders.schema.js";
export declare function getAllOrders(): Promise<any[]>;
export declare function getOrderStatus(id: string): Promise<{
    status: string;
} | null>;
export declare function updateOrderStatus(id: string, body: UpdateOrderStatusBody): Promise<any>;
//# sourceMappingURL=orders.service.d.ts.map