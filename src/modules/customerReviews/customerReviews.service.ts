import { prisma } from "../../services/db";

export async function getCustomerReviews() {
  return prisma.review.findMany({
    where: { rating: { gte: 4 } },
    include: {
      user: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 3,
  });
}
