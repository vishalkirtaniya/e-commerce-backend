export const customerReviewsSchema = {
  schema: {
    tags: ["Reviews"],
    summary: "Get 3 most recent verified customer reviews for the homepage",
    response: {
      200: {
        type: "array",
        items: {
          type: "object",
          required: ["id", "name", "rating", "comment", "verified"],
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            rating: { type: "number", examples: [4.5] },
            comment: { type: "string" },
            verified: { type: "boolean" },
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
