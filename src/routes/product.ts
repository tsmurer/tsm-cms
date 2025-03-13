import { Hono } from 'hono';
import { createProduct, deleteProduct, getProduct, getProducts, updateProduct } from '../controllers/product';

export const productRouter = new Hono();

productRouter.get('/', getProducts);
productRouter.post('/', createProduct);
productRouter.get('/:id', getProduct);
productRouter.put('/:id', updateProduct);
productRouter.delete('/:id', deleteProduct);

export default productRouter;