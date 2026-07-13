import type { AddToCartInput, UpdateCartItemInput, ApplyPromoInput } from "./cart.schema";
export declare function getCart(userId: string): Promise<{
    cart_id: number;
    items: any[];
    summary: {
        subtotal: number;
        discount_percent: number;
        discount_amount: number;
        delivery_fee: number;
        total: number;
    };
}>;
export declare function addToCart(userId: string, input: AddToCartInput): Promise<any>;
export declare function updateCartItem(userId: string, itemId: number, input: UpdateCartItemInput): Promise<any>;
export declare function removeCartItem(userId: string, itemId: number): Promise<{
    message: string;
}>;
export declare function clearCart(userId: string): Promise<{
    message: string;
}>;
export declare function applyPromo(userId: string, input: ApplyPromoInput): Promise<{
    message: string;
    discount_percent: number;
}>;
export declare function removePromo(userId: string): Promise<{
    message: string;
}>;
//# sourceMappingURL=cart.service.d.ts.map