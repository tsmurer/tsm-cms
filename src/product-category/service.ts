import type { Database } from 'bun:sqlite';
import type { ProductCategory, ProductCategoryDB } from './types';

export const ProductCategoryService = (db: Database) => {
  const mapProductCategoryDBToProductCategory = (productCategoryDB: ProductCategoryDB): ProductCategory => {
    return {
      id: productCategoryDB.id,
      name: productCategoryDB.name,
      description: productCategoryDB.description || undefined,
    };
  };

  return {
    getAllProductCategories: async (): Promise<ProductCategory[]> => {
      const categoriesQuery = db.prepare('SELECT * FROM product_categories');
      const categoriesDB = categoriesQuery.all() as ProductCategoryDB[];

      return categoriesDB.map(mapProductCategoryDBToProductCategory);
    },

    getProductCategoryById: async (id: number): Promise<ProductCategory | null> => {
      const categoryQuery = db.prepare('SELECT * FROM product_categories WHERE id = ?');
      const categoryDB = categoryQuery.get(id) as ProductCategoryDB | undefined;

      if (!categoryDB) return null;

      return mapProductCategoryDBToProductCategory(categoryDB);
    },

    createProductCategory: async (categoryData: Omit<ProductCategoryDB, 'id'>): Promise<ProductCategory> => {
      const { name, description } = categoryData;

      const insertCategory = db.prepare(`
        INSERT INTO product_categories (name, description)
        VALUES (?, ?)
        RETURNING *
      `);
      const categoryDB = insertCategory.get(name, description || null) as ProductCategoryDB;

      return mapProductCategoryDBToProductCategory(categoryDB);
    },

    updateProductCategory: async (id: number, categoryData: Partial<ProductCategoryDB>): Promise<ProductCategory | null> => {
        const { name, description } = categoryData;
      
        const existingCategoryQuery = db.prepare('SELECT * FROM product_categories WHERE id = ?');
        const existingCategory = existingCategoryQuery.get(id) as ProductCategoryDB | undefined;
      
        if (!existingCategory) {
          return null;
        }
      
        const updateCategory = db.prepare(`
          UPDATE product_categories
          SET name = ?, description = ?
          WHERE id = ?
          RETURNING *
        `);
      
        const descriptionToUpdate =
          description !== undefined ? description : existingCategory.description;
      
        const categoryDB = updateCategory.get(
          name || existingCategory.name,
          descriptionToUpdate === undefined ? null : descriptionToUpdate, // Convert undefined to null
          id
        ) as ProductCategoryDB | undefined;
      
        if (!categoryDB) return null;
      
        return mapProductCategoryDBToProductCategory(categoryDB);
      },

    deleteProductCategory: async (id: number): Promise<boolean> => {
      const deleteCategory = db.prepare('DELETE FROM product_categories WHERE id = ?');
      const result = deleteCategory.run(id);
      return result.changes > 0;
    },
  };
};

import { db } from '../db/index';
export default ProductCategoryService(db);