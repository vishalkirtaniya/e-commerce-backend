import type { CreateProductBody, UpdateProductBody } from "./products.schema.js";
export declare function getAllProducts(): Promise<any[]>;
export declare function getProductById(id: string): Promise<any>;
export declare function createProduct(body: CreateProductBody): Promise<any>;
export declare function updateProduct(id: string, body: UpdateProductBody): Promise<any>;
export declare function deleteProduct(id: string): Promise<{
    archived: boolean;
    product: any;
} | {
    archived: boolean;
    product?: undefined;
}>;
export declare function toggleSoldOut(id: string, isSoldOut: boolean): Promise<any>;
//# sourceMappingURL=products.service.d.ts.map