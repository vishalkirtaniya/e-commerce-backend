export const topSellingSchema = {
  schema: {
    tags: ["Products"],
    summary: "Get top 4 best-selling products by total quantity sold",
    response: {
      200: {
        type: "array",
        items: {
          type: "object",
          required: ["id", "name", "price", "rating", "image"],
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            price: { type: "string", examples: ["$212"] },
            originalPrice: { type: "string", examples: ["$232"] },
            discount: { type: "string", examples: ["-20%"] },
            rating: { type: "number", examples: [4.5] },
            image: { type: "string" },
          },
        },
      },
      500: {
        type: "object",
        properties: { error: { type: "string" } },
      },
    },
  },
};
