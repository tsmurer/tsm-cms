import type { Context } from 'hono';
import type { Product } from './product';

let products: Product[] = [];
let nextProductId = 1;

export async function getProducts(c: Context) {
    return c.json(products);
}

export async function createProduct(c: Context) {
  const productData = await c.req.json<Product>();

  if (!productData) {
    return c.json({ message: 'Invalid product data' }, 400);
  }

  const newProduct: Product = {
    ...productData,
    id: nextProductId++,
    active: true
  };

  products.push(newProduct);

  return c.json(newProduct, 201);
}

export async function getProduct(c:Context){
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)){
        return c.json({message: "Invalid ID"}, 400);
    }
    const product = products.find((product)=> product.id === id);
    if (!product){
        return c.json({message: "Product not found"}, 404);
    }
    return c.json(product);
}

export async function updateProduct(c: Context){
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)){
        return c.json({message: "Invalid ID"}, 400);
    }
    const productIndex = products.findIndex((product)=> product.id === id);
    if (productIndex === -1){
        return c.json({message: "Product not found"}, 404);
    }
    const productData = await c.req.json<Product>();
    if (!productData){
        return c.json({ message: 'Invalid product data' }, 400);
    }
    products[productIndex] = {
        ...productData,
        id: id,
    }
    return c.json(products[productIndex], 200);

}
export async function deleteProduct(c:Context){
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)){
        return c.json({message: "Invalid ID"}, 400);
    }
    const productIndex = products.findIndex((product)=> product.id === id);
    if (productIndex === -1){
        return c.json({message: "Product not found"}, 404);
    }
    products.splice(productIndex, 1);
    return c.json({message: "Product deleted"}, 200);
}