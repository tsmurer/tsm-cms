import type { Context } from "hono";
import type { ProductCategory } from "./types";

let productCategories: ProductCategory[] = [];
let nextProductId = 1;

export async function getProductCategories(c: Context) {
    return c.json(productCategories)
}

export async function createProductCategory(c: Context) {
    const productCategoryData = await c.req.json<ProductCategory>();

    if (!productCategoryData) {
        return c.json({ message: 'Invalid product data' }, 400);
    }

    const newProductCategory: ProductCategory = {
        ...productCategoryData,
        id: nextProductId++
    }

    productCategories.push(newProductCategory);
    return c.json(newProductCategory, 201);
}


export async function getProductCategory(c:Context){
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)){
        return c.json({message: "Invalid ID"}, 400);
    }
    const productCategory = productCategories.find((productCategory)=> productCategory.id === id);
    if (!productCategory){
        return c.json({message: "Product Category not found"}, 404);
    }
    return c.json(productCategory);
}

export async function updateProductCategory(c: Context){
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)){
        return c.json({message: "Invalid ID"}, 400);
    }
    const productCategoryIndex = productCategories.findIndex((productCategory)=> productCategory.id === id);
    if (productCategoryIndex === -1){
        return c.json({message: "Product not found"}, 404);
    }
    const productCategoryData = await c.req.json<ProductCategory>();
    if (!productCategoryData){
        return c.json({ message: 'Invalid product data' }, 400);
    }
    productCategories[productCategoryIndex] = {
        ...productCategoryData,
        id: id,
    }
    return c.json(productCategories[productCategoryIndex], 200);

}
export async function deleteProductCategory(c:Context){
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)){
        return c.json({message: "Invalid ID"}, 400);
    }
    const productCategoryIndex = productCategories.findIndex((productCategory)=> productCategory.id === id);
    if (productCategoryIndex === -1){
        return c.json({message: "Product Category not found"}, 404);
    }
    productCategories.splice(productCategoryIndex, 1);
    return c.json({message: "Product Category deleted"}, 200);
}