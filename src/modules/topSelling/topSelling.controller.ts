import { FastifyRequest, FastifyReply } from "fastify"
import { getTopSellingProducts } from "./topSelling.service"

export async function topSelling(req: FastifyRequest, reply: FastifyReply) {
  try {
    const data = await getTopSellingProducts()

    const products = data.map((p: any) => {
      const hasDiscount = p.original_price && p.original_price > p.price
      const discountPercent = hasDiscount
        ? `-${Math.round((1 - p.price / p.original_price) * 100)}%`
        : undefined

      return {
        id:            p.id,
        name:          p.name,
        price:         `$${p.price}`,
        ...(hasDiscount && { originalPrice: `$${p.original_price}` }),
        ...(hasDiscount && { discount: discountPercent }),
        rating:        p.rating ? parseFloat(p.rating) : 0,
        image:         p.product_images?.[0]?.image_url ?? "",
      }
    })

    return reply.send(products)
  } catch (err) {
    req.log.error(err)
    return reply.status(500).send({ error: "Internal server error" })
  }
}