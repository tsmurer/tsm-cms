import type { ProductCategory } from "./product-category";

export interface Product {
    id: number,
    name: string,
    description: string,
    category: ProductCategory,
    suggestedPairings: Product[],
    active: boolean
}