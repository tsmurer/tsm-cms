import { Hono } from "hono";
import { createProductCategory, deleteProductCategory, getProductCategories, getProductCategory, updateProductCategory } from "../controllers/product-category";

const productCategoryRouter = new Hono();

productCategoryRouter.get('/', getProductCategories);
productCategoryRouter.post('/', createProductCategory);
productCategoryRouter.get('/:id', getProductCategory);
productCategoryRouter.put('/:id', updateProductCategory);
productCategoryRouter.delete('/:id', deleteProductCategory);

export default productCategoryRouter;