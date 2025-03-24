import type { ProductCategory } from "../product-category/types";
import type { Product, ProductDB } from "../product/types";

const mockCategory: ProductCategory = {
  id: 1,
  name: 'Category 1',
  description: 'A sample category',
};

const mockProduct: Product = {
  id: 1,
  name: 'Product 1',
  description: 'A sample product',
  category: mockCategory,
  suggestedPairings: [],
  active: true,
};

const mockProductDB: ProductDB = {
  id: 1,
  name: 'Product 1',
  description: 'A sample product',
  category_id: 1,
  active: 1, // SQLite uses 1 for true
};