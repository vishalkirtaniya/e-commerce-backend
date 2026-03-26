"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jwt_1 = require("../utils/jwt");
const redis_1 = require("../services/redis");
async function authMiddleware(req, reply) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return reply.status(401).send({
            error: "Unauthorized"
        });
    }
    const token = authHeader.split(" ")[1];
    try {
        const payload = (0, jwt_1.verifyToken)(token);
        const session = await redis_1.redis.get(`session:${payload.sessionId}`);
        if (!session) {
            return reply.status(401).send({
                error: "Session expired"
            });
        }
        ;
        req.userId = payload.userId;
    }
    catch (err) {
        return reply.status(401).send({
            error: "Invalid token"
        });
    }
}
