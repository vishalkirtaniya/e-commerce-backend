"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProducts = getProducts;
exports.getProduct = getProduct;
exports.getProductsCategory = getProductsCategory;
exports.addProduct = addProduct;
const redis_1 = require("../../services/redis");
const products_service_1 = require("./products.service");
async function getProducts(req) {
    const cache = await redis_1.redis.get("products");
    if (cache) {
        return JSON.parse(cache);
    }
    const products = await (0, products_service_1.getAllProducts)();
    await redis_1.redis.set("products", JSON.stringify(products), "EX", 60);
    return products;
}
async function getProduct(req) {
    const { id } = req.params;
    const cache = await redis_1.redis.get(`product:${id}`);
    if (cache) {
        return JSON.parse(cache);
    }
    const product = await (0, products_service_1.getProductById)(id);
    await redis_1.redis.set(`product:${id}`, JSON.stringify(product), "EX", 60);
    return product;
}
async function getProductsCategory(req) {
    const { category } = req.params;
    const products = await (0, products_service_1.getProductsByCategory)(category);
    return products;
}
async function addProduct(req, reply) {
    const product = req.body;
    const newProduct = await (0, products_service_1.createProduct)(product);
    return newProduct;
}
