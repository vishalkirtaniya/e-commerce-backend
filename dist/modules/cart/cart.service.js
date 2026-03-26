"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserCart = getUserCart;
exports.addCartItem = addCartItem;
exports.updateCartItemQuantity = updateCartItemQuantity;
exports.removeCartItem = removeCartItem;
exports.clearUserCart = clearUserCart;
const prisma_1 = require("../../services/prisma");
async function getUserCart(userId) {
    return prisma_1.prisma.cartItem.findMany({
        where: { userId },
        include: { product: true }
    });
}
async function addCartItem(userId, productId, quantity) {
    const existingItem = await prisma_1.prisma.cartItem.findUnique({
        where: {
            userId_productId: {
                userId,
                productId
            }
        }
    });
    if (existingItem) {
        return prisma_1.prisma.cartItem.update({
            where: { id: existingItem.id },
            data: {
                quantity: existingItem.quantity + quantity
            }
        });
    }
    return prisma_1.prisma.cartItem.create({
        data: {
            userId,
            productId,
            quantity
        }
    });
}
async function updateCartItemQuantity(itemId, quantity) {
    return prisma_1.prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity }
    });
}
async function removeCartItem(itemId) {
    return prisma_1.prisma.cartItem.delete({
        where: { id: itemId }
    });
}
async function clearUserCart(userId) {
    return prisma_1.prisma.cartItem.deleteMany({
        where: { userId }
    });
}
