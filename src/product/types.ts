import type { ProductCategory } from "../product-category/types";

export interface Product {
    id: number,
    name: string,
    description?: string,
    category: ProductCategory,
    suggestedPairings?: Product[],
    active: boolean
}

export interface ProductDB {
    id: number;
    name: string;
    description: string;
    category_id: number;
    active: number; // SQLite stores booleans as 1 or 0
  }