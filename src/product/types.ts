import type { ProductCategory } from "../product-category/types";

export interface Product {
    id: number,
    name: string,
    description: string,
    category: ProductCategory,
    suggestedPairings: Product[],
    active: boolean
}