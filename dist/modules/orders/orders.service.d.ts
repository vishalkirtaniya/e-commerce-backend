import type { PlaceOrderInput } from "./orders.schema";
export declare function getOrders(userId: string): Promise<any[]>;
export declare function getOrderById(userId: string, orderNumber: string): Promise<any>;
export declare function placeOrder(userId: string, input: PlaceOrderInput): Promise<{
    order_number: any;
    total: number;
    estimated_delivery: string;
    message: string;
}>;
//# sourceMappingURL=orders.service.d.ts.map