import { prisma } from "../../services/db";

export async function getAllProducts() {
  return prisma.product.findMany();
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
  });
}

export async function getProductsByCategory(category: string) {
  return prisma.product.findMany({
    where: { category },
  });
}

export async function createProduct(product: any) {
  return prisma.product.create({
    data: product,
  });
}

export async function updateProduct(id: string, product: any) {
  return prisma.product.update({
    where: { id },
    data: product,
  });
}

export async function deleteProduct(id: string) {
  return prisma.product.delete({
    where: { id },
  });
}
