"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAdminJWT = verifyAdminJWT;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const admin_service_js_1 = require("../shared/admin.service.js");
async function verifyAdminJWT(request, reply) {
    const authHeader = request.headers['authorization'];
    if (!authHeader?.startsWith('Bearer ')) {
        return reply.code(401).send({ error: 'Missing or malformed Authorization header' });
    }
    const token = authHeader.slice(7);
    let payload;
    try {
        payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    }
    catch {
        return reply.code(401).send({ error: 'Invalid or expired token' });
    }
    const admin = await (0, admin_service_js_1.getAdminWithPermissions)(payload.sub);
    if (!admin) {
        return reply.code(403).send({ error: 'Access denied: not an active admin' });
    }
    request.admin = admin;
}
//# sourceMappingURL=verifyAdminJWT.js.map