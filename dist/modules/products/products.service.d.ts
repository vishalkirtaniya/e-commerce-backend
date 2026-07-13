import type { ProductsQuery } from "./products.schema";
export declare function getProducts(query: ProductsQuery): Promise<{
    data: any[];
    meta: {
        total: number;
        page: number;
        limit: number;
        total_pages: number;
        has_next: boolean;
        has_prev: boolean;
    };
}>;
export declare function getProductBySlug(slug: string): Promise<any>;
export declare function getFilterOptions(): Promise<{
    categories: any[];
    occasions: any[];
    materials: any[];
    price_range: {
        min: number;
        max: number;
    };
}>;
//# sourceMappingURL=products.service.d.ts.map