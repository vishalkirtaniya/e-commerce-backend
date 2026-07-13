"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPlugins = registerPlugins;
const cors_1 = __importDefault(require("@fastify/cors"));
const multipart_1 = __importDefault(require("@fastify/multipart"));
const fastify_raw_body_1 = __importDefault(require("fastify-raw-body"));
async function registerPlugins(fastify) {
    await fastify.register(fastify_raw_body_1.default, {
        field: "rawBody",
        global: false,
        encoding: "utf8",
        runFirst: true,
    });
    await fastify.register(cors_1.default, {
        origin: process.env.NODE_ENV === "production"
            ? ["https://your-frontend-domain.com"]
            : true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    });
    await fastify.register(multipart_1.default, {
        limits: {
            fileSize: 10 * 1024 * 1024, // 10MB
        },
    });
}
//# sourceMappingURL=index.js.map