import { FastifyRequest, FastifyReply } from "fastify";
import { TopSellingQuerySchema } from "./topSelling.schema";
import { getTopSelling } from "./topSelling.service";

// ── GET /api/top-selling ──────────────────────────────────────
export async function getTopSellingHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const parsed = TopSellingQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    return reply
      .status(400)
      .send({ error: parsed.error.flatten().fieldErrors });
  }

  try {
    const data = await getTopSelling(parsed.data.limit);
    return reply.status(200).send({ data });
  } catch (err) {
    request.log.error(err);
    return reply
      .status(500)
      .send({ error: "Failed to fetch top selling products" });
  }
}
