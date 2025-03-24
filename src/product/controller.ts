import type { Context } from 'hono';
import productService from './service';

export async function getProducts(c: Context) {
  try {
    const products = await productService.getAllProducts();
    return c.json(products); 
  } catch (error) {
    return c.json({ message: 'Failed to fetch products', details: error }, 500); 
  }
}

export async function createProduct(c: Context) {
  try {
    const productData = await c.req.json();
    const newProduct = await productService.createProduct(productData);
    return c.json(newProduct, 201); 
  } catch (error) {
    return c.json({ message: 'Failed to create product', details: error }, 400);
  }
}

export async function getProduct(c: Context) {
  try {
    const id = parseInt(c.req.param('id'));
    if (isNaN(id)) {
      return c.json({ message: 'Invalid ID' }, 400);
    }

    const product = await productService.getProductById(id);
    if (!product) {
      return c.json({ message: 'Product not found' }, 404);
    }

    return c.json(product);
  } catch (error) {
    return c.json({ message: 'Failed to fetch product', details: error }, 500);
  }
}

export async function updateProduct(c: Context) {
  try {
    const id = parseInt(c.req.param('id'));
    if (isNaN(id)) {
      return c.json({ message: 'Invalid ID' }, 400);
    }

    const productData = await c.req.json();
    const updatedProduct = await productService.updateProduct(id, productData);
    if (!updatedProduct) {
      return c.json({ message: 'Product not found' }, 404);
    }

    return c.json(updatedProduct, 200);
  } catch (error) {
    return c.json({ message: 'Failed to update product', details: error }, 400);
  }
}

export async function deleteProduct(c: Context) {
  try {
    const id = parseInt(c.req.param('id'));
    if (isNaN(id)) {
      return c.json({ message: 'Invalid ID' }, 400);
    }

    const success = await productService.deleteProduct(id);
    if (!success) {
      return c.json({ message: 'Product not found' }, 404);
    }

    return c.json({ message: 'Product deleted' }, 200);
  } catch (error) {
    return c.json({ message: 'Failed to delete product', details: error }, 500);
  }
}