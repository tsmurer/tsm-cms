import { Hono } from 'hono';
import productRouter from './product/routes';
import productCategoryRouter from './product-category/routes';

export const app = new Hono();

app.get('/', (c) => {
  return c.text('tsm-cms');
});

app.route("/product", productRouter);
app.route("/productCategory", productCategoryRouter);

Bun.serve({
  fetch: app.fetch,
  port: 3000,
});

console.log('Server is running on port 3000');