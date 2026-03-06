export const newArrivalsSchema = {
  schema: {
    tags: ["Products"],
    summary: "Get 4 most recently added products for the New Arrivals section",
    response: {
      200: {
        type: "array",
        items: {
          type: "object",
          required: ["id", "name", "price", "rating", "image"],
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            price: { type: "string", examples: ["$120"] },
            originalPrice: { type: "string", examples: ["$160"] },
            discount: { type: "string", examples: ["-20%"] },
            rating: { type: "number", examples: [4.5] },
            image: { type: "string" },
          },
        },
      },
      500: {
        type: "object",
        properties: {
          error: { type: "string" },
        },
      },
    },
  },
}