import { prisma } from "../../services/db";

export async function getNewArrivals() {
  return prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    take: 4,
  });
}
