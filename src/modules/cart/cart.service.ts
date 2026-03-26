import { prisma } from "../../services/db";

export async function getUserCart(userId: string) {
  return prisma.cartItem.findMany({
    where: { userId },
    include: { product: true },
  });
}

export async function addCartItem(
  userId: string,
  productId: string,
  quantity: number,
) {
  const existingItem = await prisma.cartItem.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });

  if (existingItem) {
    return prisma.cartItem.update({
      where: { id: existingItem.id },
      data: {
        quantity: existingItem.quantity + quantity,
      },
    });
  }

  return prisma.cartItem.create({
    data: {
      userId,
      productId,
      quantity,
    },
  });
}

export async function updateCartItemQuantity(itemId: string, quantity: number) {
  return prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity },
  });
}

export async function removeCartItem(itemId: string) {
  return prisma.cartItem.delete({
    where: { id: itemId },
  });
}

export async function clearUserCart(userId: string) {
  return prisma.cartItem.deleteMany({
    where: { userId },
  });
}
