export declare function uploadProductImage(productId: string, fileBuffer: Buffer, originalName: string, mimeType: string): Promise<any>;
export declare function getProductImages(productId: string): Promise<any[]>;
export declare function setPrimaryImage(productId: string, imageId: string): Promise<any>;
export declare function reorderImages(productId: string, orderedIds: number[]): Promise<void>;
export declare function deleteProductImage(productId: string, imageId: string): Promise<void>;
//# sourceMappingURL=product-images.service.d.ts.map