"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = productRoutes;
const products_controller_1 = require("./products.controller");
async function productRoutes(app) {
    app.get("/products", products_controller_1.getProducts);
    app.get("/products/:id", products_controller_1.getProduct);
    app.get("/products/category/:category", products_controller_1.getProductsCategory);
    app.post("/products", products_controller_1.addProduct);
}
