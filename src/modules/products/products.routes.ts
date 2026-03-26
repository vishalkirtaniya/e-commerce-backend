import { FastifyInstance } from 'fastify';
import {
  getProductsHandler,
  getFiltersHandler,
  getProductBySlugHandler,
} from './products.controller';

export async function productRoutes(fastify: FastifyInstance) {
  // GET /api/products?category=led-gifts&occasion=birthday&material=Acrylic&min_price=200&max_price=800&sort_by=price_asc&page=1&limit=12
  fastify.get('/', getProductsHandler);

  // GET /api/products/filters  ← must be before /:slug
  fastify.get('/filters', getFiltersHandler);

  // GET /api/products/led-spotify-stc-01
  fastify.get('/:slug', getProductBySlugHandler);
}