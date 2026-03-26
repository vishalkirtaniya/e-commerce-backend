"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllProducts = getAllProducts;
exports.getProductById = getProductById;
exports.getProductBySlug = getProductBySlug;
exports.getProductsByCategory = getProductsByCategory;
exports.createProduct = createProduct;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
const prisma_1 = require("../../services/prisma");
async function getAllProducts() {
    return prisma_1.prisma.product.findMany();
}
async function getProductById(id) {
    return prisma_1.prisma.product.findUnique({
        where: { id }
    });
}
async function getProductBySlug(slug) {
    return prisma_1.prisma.product.findUnique({
        where: { slug }
    });
}
async function getProductsByCategory(category) {
    return prisma_1.prisma.product.findMany({
        where: { category }
    });
}
async function createProduct(product) {
    return prisma_1.prisma.product.create({
        data: product
    });
}
async function updateProduct(id, product) {
    return prisma_1.prisma.product.update({
        where: { id },
        data: product
    });
}
async function deleteProduct(id) {
    return prisma_1.prisma.product.delete({
        where: { id }
    });
}
