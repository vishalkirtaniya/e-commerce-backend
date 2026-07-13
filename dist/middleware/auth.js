"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const jwt_1 = require("../utils/jwt");
const redis_1 = __importDefault(require("../services/redis"));
async function authenticate(request, reply) {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.status(401).send({ error: 'Missing or invalid Authorization header' });
    }
    const token = authHeader.slice(7); // strip "Bearer "
    // Check if token has been blocklisted (i.e. user logged out)
    const isBlocklisted = await redis_1.default.get(`blocklist:${token}`);
    if (isBlocklisted) {
        return reply.status(401).send({ error: 'Token has been revoked. Please log in again.' });
    }
    try {
        const payload = (0, jwt_1.verifyAccessToken)(token);
        // Attach to request so route handlers can use it
        request.user = payload;
    }
    catch (err) {
        if (err.name === 'TokenExpiredError') {
            return reply.status(401).send({ error: 'Access token expired. Please refresh.' });
        }
        return reply.status(401).send({ error: 'Invalid access token' });
    }
}
//# sourceMappingURL=auth.js.map