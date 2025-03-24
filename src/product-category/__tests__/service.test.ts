// src/services/productCategoryService.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { Database } from 'bun:sqlite';
import { ProductCategoryService } from '../service';
import type { ProductCategoryDB } from '../types';

describe('ProductCategoryService (SQLite)', () => {
  let db: Database;
  let service: ReturnType<typeof ProductCategoryService>;

  beforeEach(() => {
    // Initialize a new in-memory SQLite database for each test
    db = new Database(':memory:');
    db.exec(`
      CREATE TABLE product_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NULL
      )
    `);
    service = ProductCategoryService(db);
  
    // Insert some initial data
    const initialCategories: Omit<ProductCategoryDB, 'id'>[] = [
      { name: 'Electronics', description: 'Electronic devices and accessories' },
      { name: 'Clothing', description: 'Apparel for men, women, and children' },
    ];
  
    const insert = db.prepare('INSERT INTO product_categories (name, description) VALUES (?, ?)');
    initialCategories.forEach(category => {
      insert.run(category.name, category.description === undefined ? null : category.description);
    });
  });

  afterEach(() => {
    db.close();
  });

  describe('getAllProductCategories', () => {
    it('should return all product categories', async () => {
      const categories = await service.getAllProductCategories();
      expect(categories).toEqual([
        { id: 1, name: 'Electronics', description: 'Electronic devices and accessories' },
        { id: 2, name: 'Clothing', description: 'Apparel for men, women, and children' },
      ]);
    });
  });

  describe('getProductCategoryById', () => {
    it('should return a product category by ID', async () => {
      const category = await service.getProductCategoryById(1);
      expect(category).toEqual({ id: 1, name: 'Electronics', description: 'Electronic devices and accessories' });
    });

    it('should return null if category is not found', async () => {
      const category = await service.getProductCategoryById(99);
      expect(category).toBeNull();
    });
  });

  describe('createProductCategory', () => {
    it('should create a new product category', async () => {
      const newCategoryData: Omit<ProductCategoryDB, 'id'> = { name: 'Books', description: 'A collection of books' };
      const newCategory = await service.createProductCategory(newCategoryData);
      expect(newCategory).toEqual({ id: 3, name: 'Books', description: 'A collection of books' });

      const allCategories = await service.getAllProductCategories();
      expect(allCategories.length).toBe(3);
    });
  });

  describe('updateProductCategory', () => {
    it('should update a product category', async () => {
      const updatedCategoryData: Omit<ProductCategoryDB, 'id'> = { name: 'Updated Electronics', description: 'Updated description' };
      const updatedCategory = await service.updateProductCategory(1, updatedCategoryData);
      expect(updatedCategory).toEqual({ id: 1, name: 'Updated Electronics', description: 'Updated description' });

      const category = await service.getProductCategoryById(1);
      expect(category).toEqual({ id: 1, name: 'Updated Electronics', description: 'Updated description' });
    });

    it('should return null if category to update is not found', async () => {
      const updatedCategoryData: Omit<ProductCategoryDB, 'id'> = { name: 'Updated Electronics', description: 'Updated description' };
      const updatedCategory = await service.updateProductCategory(99, updatedCategoryData);
      expect(updatedCategory).toBeNull();
    });

  });

  describe('deleteProductCategory', () => {
    it('should delete a product category', async () => {
      const result = await service.deleteProductCategory(1);
      expect(result).toBe(true);

      const category = await service.getProductCategoryById(1);
      expect(category).toBeNull();

      const allCategories = await service.getAllProductCategories();
      expect(allCategories.length).toBe(1);
    });

    it('should return false if category to delete is not found', async () => {
      const result = await service.deleteProductCategory(99);
      expect(result).toBe(false);
    });
  });
});
