import type { Context } from 'hono';
import productCategoryService from './service';
import type { ProductCategory } from './types';

export const getProductCategories = async (c: Context) => {
  try {
    const categories = await productCategoryService.getAllProductCategories();
    return c.json(categories);
  } catch (error) {
    console.error('Failed to fetch product categories:', error);
    return c.json({ message: 'Failed to fetch product categories', details: error }, 500);
  }
};

export const getProductCategory = async (c: Context) => {
  try {
    const id = parseInt(c.req.param('id'));
    if (isNaN(id)) {
      return c.json({ message: 'Invalid ID' }, 400);
    }

    const category = await productCategoryService.getProductCategoryById(id);
    if (!category) {
      return c.json({ message: 'Product category not found' }, 404);
    }

    return c.json(category);
  } catch (error) {
    console.error(`Failed to fetch product category with id ${c.req.param('id')}:`, error);
    return c.json({ message: 'Failed to fetch product category', details: error }, 500);
  }
};

export const createProductCategory = async (c: Context) => {
  try {
    const categoryData: Omit<ProductCategory, 'id'> = await c.req.json();
    const newCategory = await productCategoryService.createProductCategory(categoryData);
    return c.json(newCategory, 201);
  } catch (error) {
    console.error('Failed to create product category:', error);
    return c.json({ message: 'Failed to create product category', details: error }, 400);
  }
};

export const updateProductCategory = async (c: Context) => {
  try {
    const id = parseInt(c.req.param('id'));
    if (isNaN(id)) {
      return c.json({ message: 'Invalid ID' }, 400);
    }

    const categoryData: Omit<ProductCategory, 'id'> = await c.req.json();
    const updatedCategory = await productCategoryService.updateProductCategory(id, categoryData);

    if (!updatedCategory) {
      return c.json({ message: 'Product category not found' }, 404);
    }

    return c.json(updatedCategory);
  } catch (error) {
    console.error(`Failed to update product category with id ${c.req.param('id')}:`, error);
    return c.json({ message: 'Failed to update product category', details: error }, 400);
  }
};

export const deleteProductCategory = async (c: Context) => {
  try {
    const id = parseInt(c.req.param('id'));
    if (isNaN(id)) {
      return c.json({ message: 'Invalid ID' }, 400);
    }

    const success = await productCategoryService.deleteProductCategory(id);
    if (!success) {
      return c.json({ message: 'Product category not found' }, 404);
    }

    return c.json({ message: 'Product category deleted' }, 200);
  } catch (error) {
    console.error(`Failed to delete product category with id ${c.req.param('id')}:`, error);
    return c.json({ message: 'Failed to delete product category', details: error }, 500);
  }
};