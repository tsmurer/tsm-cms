import { describe, it, expect, mock, beforeEach, afterEach } from 'bun:test';
import type { Context } from 'hono';
import {
  getProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
} from '../controller';

// Mock the productService
const mockProductService = {
  getAllProducts: mock(() => Promise.resolve([{ id: 1, name: 'Product 1' }])),
  createProduct: mock((data: any) => Promise.resolve({ id: 1, ...data })),
  getProductById: mock((id: number) => Promise.resolve(id === 1 ? { id: 1, name: 'Product 1' } : null)),
  updateProduct: mock((id: number, data: any) => Promise.resolve(id === 1 ? { id: 1, ...data } : null)),
  deleteProduct: mock((id: number) => Promise.resolve(id === 1)),
};

mock.module('../service', () => ({
  default: mockProductService,
}));

describe('Product Controller', () => {
  let mockContext: Context;

  beforeEach(() => {
    mockContext = {
      req: {
        param: (key: string) => (key === 'id' ? '1' : null),
        json: () => Promise.resolve({}),
        path: '/',
        method: 'GET',
        headers: new Headers(),
        raw: new Request('http://localhost'),
        routeIndex: 0,
        bodyCache: undefined,
        query: () => ({}),
        header: () => null,
        parseBody: () => Promise.resolve({}),
        valid: () => ({}),
        addValidatedData: () => {},
        getValidatedData: () => ({}),
      },
      json: (data: any, status?: number) => {
        return new Response(JSON.stringify(data), {
          status: status || 200,
          headers: { 'Content-Type': 'application/json' },
        });
      },
    } as unknown as Context;

    // Reset mocks before each test
    mockProductService.getAllProducts.mockClear();
    mockProductService.createProduct.mockClear();
    mockProductService.getProductById.mockClear();
    mockProductService.updateProduct.mockClear();
    mockProductService.deleteProduct.mockClear();
  });

  describe('getProducts', () => {
    it('should return a list of products', async () => {
      const result = await getProducts(mockContext);
      const body = await result.json();
      expect(await body).toEqual([{ id: 1, name: 'Product 1' }]);
      expect(mockProductService.getAllProducts).toHaveBeenCalledTimes(1);
    });

    it('should handle errors', async () => {
      mockProductService.getAllProducts.mockImplementationOnce(() => Promise.reject(new Error('Failed to fetch products')));

      const result = await getProducts(mockContext);
      expect(result.status).toBe(500);
      const body = await result.json();
      expect(await body).toEqual({
        message: 'Failed to fetch products',
        details: new Error('Failed to fetch products'),
      });
      expect(mockProductService.getAllProducts).toHaveBeenCalledTimes(1);
    });
  });

  describe('createProduct', () => {
    it('should create a new product', async () => {
      (mockContext.req.json as any) = () => Promise.resolve({ name: 'New Product' });
      const result = await createProduct(mockContext);
      const body = await result.json();
      expect(await body).toEqual({ id: 1, name: 'New Product' });
      expect(result.status).toBe(201);
      expect(mockProductService.createProduct).toHaveBeenCalledTimes(1);
      expect(mockProductService.createProduct).toHaveBeenCalledWith({ name: 'New Product' });
    });

    it('should handle errors', async () => {
      mockProductService.createProduct.mockImplementationOnce(() => Promise.reject(new Error('Failed to create product')));
      (mockContext.req.json as any) = () => Promise.resolve({});

      const result = await createProduct(mockContext);
      expect(result.status).toBe(400);
      const body = await result.json();
      expect(await body).toEqual({
        message: 'Failed to create product',
        details: new Error('Failed to create product'),
      });
      expect(mockProductService.createProduct).toHaveBeenCalledTimes(1);
    });
  });

  describe('getProduct', () => {
    it('should return a product by ID', async () => {
      (mockContext.req.param as any) = () => '1';

      const result = await getProduct(mockContext);
      const body = await result.json();
      expect(await body).toEqual({ id: 1, name: 'Product 1' });
      expect(mockProductService.getProductById).toHaveBeenCalledTimes(1);
      expect(mockProductService.getProductById).toHaveBeenCalledWith(1);
    });

    it('should handle invalid ID', async () => {
      (mockContext.req.param as any) = () => 'invalid';

      const result = await getProduct(mockContext);
      expect(result.status).toBe(400);
      const body = await result.json();
      expect(await body).toEqual({ message: 'Invalid ID' });
      expect(mockProductService.getProductById).not.toHaveBeenCalled();
    });

    it('should handle product not found', async () => {
      (mockContext.req.param as any) = () => '2';

      const result = await getProduct(mockContext);
      expect(result.status).toBe(404);
      const body = await result.json();
      expect(await body).toEqual({ message: 'Product not found' });
      expect(mockProductService.getProductById).toHaveBeenCalledTimes(1);
      expect(mockProductService.getProductById).toHaveBeenCalledWith(2);
    });

    it('should handle errors', async () => {
      mockProductService.getProductById.mockImplementationOnce(() => Promise.reject(new Error('Failed to fetch product')));
      (mockContext.req.param as any) = () => '1';

      const result = await getProduct(mockContext);
      expect(result.status).toBe(500);
      const body = await result.json();
      expect(await body).toEqual({
        message: 'Failed to fetch product',
        details: new Error('Failed to fetch product'),
      });
      expect(mockProductService.getProductById).toHaveBeenCalledTimes(1);
      expect(mockProductService.getProductById).toHaveBeenCalledWith(1);
    });
  });

  describe('updateProduct', () => {
    it('should update a product', async () => {
      (mockContext.req.param as any) = () => '1';
      (mockContext.req.json as any) = () => Promise.resolve({ name: 'Updated Product' });

      const result = await updateProduct(mockContext);
      const body = await result.json();
      expect(await body).toEqual({ id: 1, name: 'Updated Product' });
      expect(mockProductService.updateProduct).toHaveBeenCalledTimes(1);
      expect(mockProductService.updateProduct).toHaveBeenCalledWith(1, { name: 'Updated Product' });
    });

    it('should handle invalid ID', async () => {
      (mockContext.req.param as any) = () => 'invalid';

      const result = await updateProduct(mockContext);
      expect(result.status).toBe(400);
      const body = await result.json();
      expect(await body).toEqual({ message: 'Invalid ID' });
      expect(mockProductService.updateProduct).not.toHaveBeenCalled();
    });

    it('should handle product not found', async () => {
      (mockContext.req.param as any) = () => '2';
      (mockContext.req.json as any) = () => Promise.resolve({});

      const result = await updateProduct(mockContext);
      expect(result.status).toBe(404);
      const body = await result.json();
      expect(await body).toEqual({ message: 'Product not found' });
      expect(mockProductService.updateProduct).toHaveBeenCalledTimes(1);
      expect(mockProductService.updateProduct).toHaveBeenCalledWith(2, {});
    });

    it('should handle errors', async () => {
      mockProductService.updateProduct.mockImplementationOnce(() => Promise.reject(new Error('Failed to update product')));
      (mockContext.req.param as any) = () => '1';
      (mockContext.req.json as any) = () => Promise.resolve({});

      const result = await updateProduct(mockContext);
      expect(result.status).toBe(400);
      const body = await result.json();
      expect(await body).toEqual({
        message: 'Failed to update product',
        details: new Error('Failed to update product'),
      });
      expect(mockProductService.updateProduct).toHaveBeenCalledTimes(1);
      expect(mockProductService.updateProduct).toHaveBeenCalledWith(1, {});
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product', async () => {
      (mockContext.req.param as any) = () => '1';

      const result = await deleteProduct(mockContext);
      const body = await result.json();
      expect(await body).toEqual({ message: 'Product deleted' });
      expect(mockProductService.deleteProduct).toHaveBeenCalledTimes(1);
      expect(mockProductService.deleteProduct).toHaveBeenCalledWith(1);
    });

    it('should handle invalid ID', async () => {
      (mockContext.req.param as any) = () => 'invalid';

      const result = await deleteProduct(mockContext);
      expect(result.status).toBe(400);
      const body = await result.json();
      expect(await body).toEqual({ message: 'Invalid ID' });
      expect(mockProductService.deleteProduct).not.toHaveBeenCalled();
    });

    it('should handle product not found', async () => {
      (mockContext.req.param as any) = () => '2';

      const result = await deleteProduct(mockContext);
      expect(result.status).toBe(404);
      const body = await result.json();
      expect(await body).toEqual({ message: 'Product not found' });
      expect(mockProductService.deleteProduct).toHaveBeenCalledTimes(1);
      expect(mockProductService.deleteProduct).toHaveBeenCalledWith(2);
    });

    it('should handle errors', async () => {
      mockProductService.deleteProduct.mockImplementationOnce(() => Promise.reject(new Error('Failed to delete product')));
      (mockContext.req.param as any) = () => '1';

      const result = await deleteProduct(mockContext);
      expect(result.status).toBe(500);
      const body = await result.json();
      expect(await body).toEqual({
        message: 'Failed to delete product',
        details: new Error('Failed to delete product'),
      });
      expect(mockProductService.deleteProduct).toHaveBeenCalledTimes(1);
      expect(mockProductService.deleteProduct).toHaveBeenCalledWith(1);
    });
  });
});