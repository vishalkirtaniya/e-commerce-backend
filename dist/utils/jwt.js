"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAccessToken = signAccessToken;
exports.verifyAccessToken = verifyAccessToken;
exports.signRefreshToken = signRefreshToken;
exports.verifyRefreshToken = verifyRefreshToken;
exports.getTokenExpiry = getTokenExpiry;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
    throw new Error('Missing JWT_SECRET or JWT_REFRESH_SECRET in .env');
}
// ── Access token (short-lived: 15m) ──────────────────────────
function signAccessToken(payload) {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
function verifyAccessToken(token) {
    return jsonwebtoken_1.default.verify(token, JWT_SECRET);
}
// ── Refresh token (long-lived: 7d) ───────────────────────────
function signRefreshToken(payload) {
    return jsonwebtoken_1.default.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
}
function verifyRefreshToken(token) {
    return jsonwebtoken_1.default.verify(token, JWT_REFRESH_SECRET);
}
// ── Extract expiry in seconds (for Redis TTL) ─────────────────
function getTokenExpiry(token) {
    const decoded = jsonwebtoken_1.default.decode(token);
    if (!decoded?.exp)
        return 0;
    return decoded.exp - Math.floor(Date.now() / 1000);
}
//# sourceMappingURL=jwt.js.map