"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = signup;
exports.login = login;
exports.logout = logout;
const auth_service_1 = require("./auth.service");
const hash_1 = require("../../utils/hash");
const jwt_1 = require("../../utils/jwt");
const redis_1 = require("../../services/redis");
const crypto_1 = require("crypto");
const jwt_2 = require("../../utils/jwt");
async function signup(req, reply) {
    const { name, email, password } = req.body;
    const existing = await (0, auth_service_1.findUserByEmail)(email);
    if (existing) {
        return reply.status(400).send({
            error: "User already exists"
        });
    }
    const password_hash = await (0, hash_1.hashPassword)(password);
    const user = await (0, auth_service_1.createUser)({
        name,
        email,
        password_hash
    });
    return {
        message: "User created",
        user
    };
}
async function login(req, reply) {
    const { email, password } = req.body;
    const user = await (0, auth_service_1.findUserByEmail)(email);
    if (!user) {
        return reply.status(401).send({
            error: "Invalid credentials"
        });
    }
    const valid = await (0, hash_1.comparePassword)(password, user.password);
    if (!valid) {
        return reply.status(401).send({
            error: "Invalid credentials"
        });
    }
    const sessionId = (0, crypto_1.randomUUID)();
    const token = (0, jwt_1.signToken)({
        userId: user.id,
        sessionId
    });
    await redis_1.redis.set(`session:${sessionId}`, JSON.stringify({
        userId: user.id
    }), "EX", 60 * 60 * 24);
    return {
        token
    };
}
async function logout(req, reply) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return reply.status(401).send({ error: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    const payload = (0, jwt_2.verifyToken)(token);
    await redis_1.redis.del(`session:${payload.sessionId}`);
    return { message: "Logged out successfully" };
}
