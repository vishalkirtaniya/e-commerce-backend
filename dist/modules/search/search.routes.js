"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = searchRoutes;
const db_js_1 = __importDefault(require("../../services/db.js"));
async function searchRoutes(fastify) {
    // GET /api/search?q=acrylic&sort=price_asc
    fastify.get("/search", async (request, reply) => {
        const { q = "", category, material, min_price, max_price, sort = "relevance", page = "1", limit = "20", } = request.query;
        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.min(50, Math.max(1, Number(limit)));
        const offset = (pageNum - 1) * limitNum;
        try {
            // Build WHERE clauses
            const conditions = [
                "p.is_archived = false",
                "p.is_sold_out = false",
            ];
            const values = [];
            let paramIdx = 1;
            // Full text search
            if (q.trim()) {
                conditions.push(`p.search_vector @@ plainto_tsquery('english', $${paramIdx})`);
                values.push(q.trim());
                paramIdx++;
            }
            // Category filter
            if (category) {
                conditions.push(`c.slug = $${paramIdx}`);
                values.push(category);
                paramIdx++;
            }
            // Material filter
            if (material) {
                conditions.push(`p.material::text = $${paramIdx}`);
                values.push(material);
                paramIdx++;
            }
            // Price range
            if (min_price) {
                conditions.push(`p.price >= $${paramIdx}`);
                values.push(Number(min_price));
                paramIdx++;
            }
            if (max_price) {
                conditions.push(`p.price <= $${paramIdx}`);
                values.push(Number(max_price));
                paramIdx++;
            }
            const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
            // Sort
            const sortClause = sort === "price_asc"
                ? "ORDER BY p.price ASC"
                : sort === "price_desc"
                    ? "ORDER BY p.price DESC"
                    : sort === "rating"
                        ? "ORDER BY p.rating DESC"
                        : sort === "newest"
                            ? "ORDER BY p.created_at DESC"
                            : q.trim()
                                ? `ORDER BY ts_rank(p.search_vector, plainto_tsquery('english', '${q.trim().replace(/'/g, "''")}')) DESC`
                                : "ORDER BY p.created_at DESC";
            // Main query
            const dataResult = await db_js_1.default.query(`
        SELECT
          p.id, p.name, p.slug, p.sku,
          p.price, p.original_price, p.discount,
          p.rating, p.review_count,
          p.material::text AS material,
          p.is_new_arrival, p.is_top_selling, p.is_customizable,
          p.is_sold_out, p.created_at,
          c.name  AS category_name,
          c.slug  AS category_slug,
          pi.url  AS image_url
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        LEFT JOIN product_images pi
          ON pi.product_id = p.id AND pi.is_primary = true
        ${whereClause}
        ${sortClause}
        LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
      `, [...values, limitNum, offset]);
            // Count query
            const countResult = await db_js_1.default.query(`
        SELECT COUNT(*)::int AS total
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        ${whereClause}
      `, values);
            const total = countResult.rows[0].total;
            return reply.send({
                hits: dataResult.rows,
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum),
            });
        }
        catch (err) {
            const message = err instanceof Error ? err.message : "Search failed";
            return reply.code(500).send({ error: message });
        }
    });
    // GET /api/search/suggestions?q=ac — fast autocomplete
    fastify.get("/search/suggestions", async (request, reply) => {
        const { q = "" } = request.query;
        if (!q.trim() || q.length < 2)
            return reply.send([]);
        try {
            const result = await db_js_1.default.query(`
      SELECT
        p.name,
        p.slug,
        p.price,
        p.rating,
        c.name AS category_name,
        pi.url AS image_url
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN product_images pi
        ON pi.product_id = p.id AND pi.is_primary = true
      WHERE
        p.is_archived = false
        AND p.is_sold_out = false
        AND (
          p.search_vector @@ plainto_tsquery('english', $1)
          OR p.name ILIKE $2
        )
      ORDER BY p.rating DESC
      LIMIT 6
    `, [q.trim(), `%${q.trim()}%`]);
            return reply.send(result.rows);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : "Suggestions failed";
            return reply.code(500).send({ error: message });
        }
    });
}
//# sourceMappingURL=search.routes.js.map