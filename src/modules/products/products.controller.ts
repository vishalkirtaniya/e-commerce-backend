import { FastifyRequest, FastifyReply } from 'fastify';
import { ProductsQuerySchema } from './products.schema';
import * as ProductsService from './products.service';

// ── GET /api/products ─────────────────────────────────────────
export async function getProductsHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const parsed = ProductsQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    return reply.status(400).send({ error: parsed.error.flatten().fieldErrors });
  }

  try {
    const result = await ProductsService.getProducts(parsed.data);
    return reply.status(200).send(result);
  } catch (err: any) {
    request.log.error(err);
    return reply.status(500).send({ error: 'Failed to fetch products' });
  }
}

// ── GET /api/products/filters ─────────────────────────────────
// NOTE: must be registered BEFORE /:slug so it doesn't get swallowed
export async function getFiltersHandler(
  _request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const result = await ProductsService.getFilterOptions();
    return reply.status(200).send(result);
  } catch (err: any) {
    _request.log.error(err);
    return reply.status(500).send({ error: 'Failed to fetch filter options' });
  }
}

// ── GET /api/products/:slug ───────────────────────────────────
export async function getProductBySlugHandler(
  request: FastifyRequest<{ Params: { slug: string } }>,
  reply: FastifyReply
) {
  const { slug } = request.params;

  try {
    const product = await ProductsService.getProductBySlug(slug);
    if (!product) {
      return reply.status(404).send({ error: `Product '${slug}' not found` });
    }
    return reply.status(200).send(product);
  } catch (err: any) {
    request.log.error(err);
    return reply.status(500).send({ error: 'Failed to fetch product' });
  }
}