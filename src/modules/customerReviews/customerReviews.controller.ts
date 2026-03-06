import { FastifyRequest, FastifyReply } from "fastify";
import { getCustomerReviews } from "./customerReviews.service";

export async function customerReviews(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const data = await getCustomerReviews();

    const reviews = data.map((r: any) => ({
      id: r.id,
      name: r.users?.name ?? "Anonymous",
      rating: parseFloat(r.rating),
      comment: r.comment ?? "",
      verified: r.verified,
    }));

    return reply.send(reviews);
  } catch (err) {
    req.log.error(err);
    return reply.status(500).send({ error: "Internal server error" });
  }
}
