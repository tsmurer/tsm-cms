import type { Database } from 'bun:sqlite';
import type { Product, ProductDB } from './types';

export const createProductService = (db: Database) => {
  const mapProductDBToProduct = (productDB: ProductDB, category: any, suggestedPairings: any[]): Product => {
    return {
      id: productDB.id,
      name: productDB.name,
      description: productDB.description || undefined,
      category: {
        id: category.id,
        name: category.name,
        description: category.description || undefined,
      },
      suggestedPairings: suggestedPairings.map((pairing) => ({
        id: pairing.id,
        name: pairing.name,
        description: pairing.description || undefined,
        category: {
          id: pairing.category_id,
          name: pairing.category_name,
          description: pairing.category_description || undefined,
        },
        active: pairing.active === 1, 
      })),
      active: productDB.active === 1, 
    };
  };
  return {
    getAllProducts: async (): Promise<Product[]> => {
      const productsQuery = db.prepare('SELECT * FROM products');
      const productsDB = productsQuery.all() as ProductDB[];

      const products = await Promise.all(
        productsDB.map(async (productDB) => {
          const categoryQuery = db.prepare('SELECT * FROM categories WHERE id = ?');
          const category = categoryQuery.get(productDB.category_id);

          const pairingsQuery = db.prepare(`
            SELECT p.id, p.name, p.description, p.active, c.id AS category_id, c.name AS category_name, c.description AS category_description
            FROM product_pairings pp
            JOIN products p ON pp.paired_product_id = p.id
            JOIN categories c ON p.category_id = c.id
            WHERE pp.product_id = ?
          `);
          const suggestedPairings = pairingsQuery.all(productDB.id);

          return mapProductDBToProduct(productDB, category, suggestedPairings);
        })
      );

      return products;
    },

    createProduct: async (productData: Omit<ProductDB, 'id'>): Promise<Product> => {
      const { name, description, category_id, active } = productData;

      const insertProduct = db.prepare(`
        INSERT INTO products (name, description, category_id, active)
        VALUES (?, ?, ?, ?)
        RETURNING *
      `);
      const productDB = insertProduct.get(
        name,
        description || null,
        category_id,
        active ?? true
      ) as ProductDB;

      const categoryQuery = db.prepare('SELECT * FROM categories WHERE id = ?');
      const category = categoryQuery.get(productDB.category_id);

      const suggestedPairings: any[] = [];

      return mapProductDBToProduct(productDB, category, suggestedPairings);
    },

    getProductById: async (id: number): Promise<Product | null> => {
      const productQuery = db.prepare('SELECT * FROM products WHERE id = ?');
      const productDB = productQuery.get(id) as ProductDB | undefined;

      if (!productDB) return null;

      const categoryQuery = db.prepare('SELECT * FROM categories WHERE id = ?');
      const category = categoryQuery.get(productDB.category_id);

      const pairingsQuery = db.prepare(`
        SELECT p.id, p.name, p.description, p.active, c.id AS category_id, c.name AS category_name, c.description AS category_description
        FROM product_pairings pp
        JOIN products p ON pp.paired_product_id = p.id
        JOIN categories c ON p.category_id = c.id
        WHERE pp.product_id = ?
      `);
      const suggestedPairings = pairingsQuery.all(id);

      return mapProductDBToProduct(productDB, category, suggestedPairings);
    },

    updateProduct: async (id: number, productData: Partial<ProductDB>): Promise<Product | null> => {
      const { name, description, category_id, active } = productData;
    
      const existingProductQuery = db.prepare('SELECT * FROM products WHERE id = ?');
      const existingProduct = existingProductQuery.get(id) as ProductDB | undefined;
    
      if (!existingProduct) {
        return null;
      }
    
      const updatedCategoryId = category_id !== undefined ? category_id : existingProduct.category_id;
    
      console.log('Updating product with data:', { name, description, category_id: updatedCategoryId, active });
    
      const updateProduct = db.prepare(`
        UPDATE products
        SET name = ?, description = ?, category_id = ?, active = ?
        WHERE id = ?
        RETURNING *
      `);
      const productDB = updateProduct.get(
        name || existingProduct.name,
        description || existingProduct.description,
        updatedCategoryId,
        active ?? existingProduct.active,
        id
      ) as ProductDB | undefined;
    
      console.log('Updated productDB:', productDB);
    
      if (!productDB) return null;
    
      const categoryQuery = db.prepare('SELECT * FROM categories WHERE id = ?');
      const category = categoryQuery.get(productDB.category_id);
    
      console.log('Fetched category:', category);
    
      if (!category) {
        throw new Error('Category not found');
      }
    
      const pairingsQuery = db.prepare(`
        SELECT p.id, p.name, p.description, p.active, c.id AS category_id, c.name AS category_name, c.description AS category_description
        FROM product_pairings pp
        JOIN products p ON pp.paired_product_id = p.id
        JOIN categories c ON p.category_id = c.id
        WHERE pp.product_id = ?
      `);
      const suggestedPairings = pairingsQuery.all(id);
    
      return mapProductDBToProduct(productDB, category, suggestedPairings);
    },
    deleteProduct: async (id: number): Promise<boolean> => {
      const deleteProduct = db.prepare('DELETE FROM products WHERE id = ?');
      const result = deleteProduct.run(id);
      return result.changes > 0;
    },
  };
};

import { db } from '../db/index';
export default createProductService(db);