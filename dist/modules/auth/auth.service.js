"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthServiceError = void 0;
exports.signup = signup;
exports.signin = signin;
exports.refreshTokens = refreshTokens;
exports.logout = logout;
exports.sendForgotPasswordOtp = sendForgotPasswordOtp;
exports.verifyOtp = verifyOtp;
exports.resetPassword = resetPassword;
const db_1 = __importDefault(require("../../services/db"));
const redis_1 = __importDefault(require("../../services/redis"));
const hash_1 = require("../../utils/hash");
const jwt_1 = require("../../utils/jwt");
const mailer_1 = require("../../services/mailer");
const crypto_1 = __importDefault(require("crypto"));
// ── Custom error for known business-rule failures ───────────────
class AuthServiceError extends Error {
    constructor(message, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
        this.name = "AuthServiceError";
    }
}
exports.AuthServiceError = AuthServiceError;
// ── OTP helpers ─────────────────────────────────────────────────
function generateOtp() {
    const bytes = crypto_1.default.randomBytes(4);
    const rand = bytes.readUInt32BE(0) % 900000;
    return (100000 + rand).toString();
}
function otpExpiresAt() {
    const minutes = Number(process.env.OTP_EXPIRY_MINUTES ?? 10);
    return new Date(Date.now() + minutes * 60 * 1000);
}
// ── SIGNUP ───────────────────────────────────────────────────────
async function signup(input) {
    const { full_name, email, password, phone } = input;
    const existing = await db_1.default.query("SELECT id FROM user_credentials WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
        throw new AuthServiceError("Email already registered", 409);
    }
    const passwordHash = await (0, hash_1.hashPassword)(password);
    const client = await db_1.default.connect();
    try {
        await client.query("BEGIN");
        const credResult = await client.query(`INSERT INTO user_credentials (email, password_hash)
       VALUES ($1, $2)
       RETURNING id`, [email, passwordHash]);
        const userId = credResult.rows[0].id;
        await client.query(`INSERT INTO user_profiles (id, full_name, phone)
       VALUES ($1, $2, $3)`, [userId, full_name, phone ?? null]);
        await client.query("COMMIT");
        const accessToken = (0, jwt_1.signAccessToken)({ userId, email });
        const refreshToken = (0, jwt_1.signRefreshToken)({ userId, email });
        await redis_1.default.set(`refresh:${userId}`, refreshToken, "EX", 7 * 24 * 60 * 60);
        return {
            user: { id: userId, email, full_name },
            access_token: accessToken,
            refresh_token: refreshToken,
        };
    }
    catch (err) {
        await client.query("ROLLBACK");
        throw err;
    }
    finally {
        client.release();
    }
}
// ── SIGNIN ───────────────────────────────────────────────────────
async function signin(input) {
    const { email, password } = input;
    const result = await db_1.default.query(`SELECT uc.id, uc.email, uc.password_hash, up.full_name
     FROM user_credentials uc
     JOIN user_profiles up ON up.id = uc.id
     WHERE uc.email = $1`, [email]);
    if (result.rows.length === 0) {
        throw new AuthServiceError("Invalid email or password", 401);
    }
    const user = result.rows[0];
    const valid = await (0, hash_1.comparePassword)(password, user.password_hash);
    if (!valid) {
        throw new AuthServiceError("Invalid email or password", 401);
    }
    const accessToken = (0, jwt_1.signAccessToken)({ userId: user.id, email: user.email });
    const refreshToken = (0, jwt_1.signRefreshToken)({ userId: user.id, email: user.email });
    await redis_1.default.set(`refresh:${user.id}`, refreshToken, "EX", 7 * 24 * 60 * 60);
    return {
        user: { id: user.id, email: user.email, full_name: user.full_name },
        access_token: accessToken,
        refresh_token: refreshToken,
    };
}
// ── REFRESH ──────────────────────────────────────────────────────
async function refreshTokens(refreshToken) {
    let payload;
    try {
        payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
    }
    catch {
        throw new AuthServiceError("Invalid or expired refresh token", 401);
    }
    const { userId, email } = payload;
    const stored = await redis_1.default.get(`refresh:${userId}`);
    if (!stored || stored !== refreshToken) {
        throw new AuthServiceError("Refresh token has been revoked or rotated", 401);
    }
    const newAccessToken = (0, jwt_1.signAccessToken)({ userId, email });
    const newRefreshToken = (0, jwt_1.signRefreshToken)({ userId, email });
    await redis_1.default.set(`refresh:${userId}`, newRefreshToken, "EX", 7 * 24 * 60 * 60);
    return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
    };
}
// ── LOGOUT ───────────────────────────────────────────────────────
async function logout(userId, accessToken) {
    const ttl = (0, jwt_1.getTokenExpiry)(accessToken);
    if (ttl > 0) {
        await redis_1.default.set(`blocklist:${accessToken}`, "1", "EX", ttl);
    }
    await redis_1.default.del(`refresh:${userId}`);
    return { message: "Logged out successfully" };
}
// ── FORGOT PASSWORD ──────────────────────────────────────────────
async function sendForgotPasswordOtp(input) {
    const client = await db_1.default.connect();
    try {
        const userResult = await client.query(`SELECT id FROM public.user_credentials WHERE email = $1 LIMIT 1`, [input.email]);
        // Silently return — prevents email enumeration
        if (userResult.rowCount === 0)
            return;
        const otp = generateOtp();
        const otpHash = await (0, hash_1.hashPassword)(otp); // reuse your existing util
        const expiresAt = otpExpiresAt();
        await client.query(`INSERT INTO public.password_reset_otps (email, otp_hash, expires_at, used)
       VALUES ($1, $2, $3, false)
       ON CONFLICT (email)
       DO UPDATE SET
         otp_hash   = EXCLUDED.otp_hash,
         expires_at = EXCLUDED.expires_at,
         used       = false,
         created_at = now()`, [input.email, otpHash, expiresAt]);
        await (0, mailer_1.sendOtpEmail)(input.email, otp);
    }
    finally {
        client.release();
    }
}
// ── VERIFY OTP ───────────────────────────────────────────────────
async function verifyOtp(input) {
    const client = await db_1.default.connect();
    try {
        const result = await client.query(`SELECT otp_hash, expires_at, used
       FROM public.password_reset_otps
       WHERE email = $1 LIMIT 1`, [input.email]);
        if (result.rowCount === 0) {
            throw new AuthServiceError("Invalid or expired OTP");
        }
        const record = result.rows[0];
        if (record.used) {
            throw new AuthServiceError("OTP has already been used");
        }
        if (new Date() > new Date(record.expires_at)) {
            throw new AuthServiceError("OTP has expired. Please request a new one");
        }
        // reuse comparePassword — both use bcrypt under the hood
        const isValid = await (0, hash_1.comparePassword)(input.otp, record.otp_hash);
        if (!isValid) {
            throw new AuthServiceError("Invalid OTP. Please try again");
        }
    }
    finally {
        client.release();
    }
}
// ── RESET PASSWORD ───────────────────────────────────────────────
async function resetPassword(input) {
    const client = await db_1.default.connect();
    try {
        await client.query("BEGIN");
        const result = await client.query(`SELECT otp_hash, expires_at, used
       FROM public.password_reset_otps
       WHERE email = $1 LIMIT 1`, [input.email]);
        if (result.rowCount === 0) {
            throw new AuthServiceError("Invalid or expired OTP");
        }
        const record = result.rows[0];
        if (record.used) {
            throw new AuthServiceError("OTP has already been used");
        }
        if (new Date() > new Date(record.expires_at)) {
            throw new AuthServiceError("OTP has expired. Please request a new one");
        }
        const isValid = await (0, hash_1.comparePassword)(input.otp, record.otp_hash);
        if (!isValid) {
            throw new AuthServiceError("Invalid OTP");
        }
        const newPasswordHash = await (0, hash_1.hashPassword)(input.new_password);
        const updateResult = await client.query(`UPDATE public.user_credentials
       SET password_hash = $1
       WHERE email = $2
       RETURNING id`, [newPasswordHash, input.email]);
        if (updateResult.rowCount === 0) {
            throw new AuthServiceError("User not found");
        }
        await client.query(`UPDATE public.password_reset_otps SET used = true WHERE email = $1`, [input.email]);
        await client.query("COMMIT");
    }
    catch (err) {
        await client.query("ROLLBACK");
        throw err;
    }
    finally {
        client.release();
    }
}
//# sourceMappingURL=auth.service.js.map