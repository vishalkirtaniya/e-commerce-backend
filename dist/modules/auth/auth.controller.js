"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.signupHandler = signupHandler;
exports.signinHandler = signinHandler;
exports.refreshHandler = refreshHandler;
exports.logoutHandler = logoutHandler;
exports.meHandler = meHandler;
exports.forgotPasswordHandler = forgotPasswordHandler;
exports.verifyOtpHandler = verifyOtpHandler;
exports.resetPasswordHandler = resetPasswordHandler;
const auth_schema_1 = require("./auth.schema");
const AuthService = __importStar(require("./auth.service"));
// ── POST /api/auth/signup ─────────────────────────────────────
async function signupHandler(request, reply) {
    const parsed = auth_schema_1.SignupSchema.safeParse(request.body);
    if (!parsed.success) {
        return reply
            .status(400)
            .send({ error: parsed.error.flatten().fieldErrors });
    }
    try {
        const result = await AuthService.signup(parsed.data);
        return reply.status(201).send(result);
    }
    catch (err) {
        return reply
            .status(err.statusCode ?? 500)
            .send({ error: err.message ?? "Internal server error" });
    }
}
// ── POST /api/auth/signin ─────────────────────────────────────
async function signinHandler(request, reply) {
    const parsed = auth_schema_1.SigninSchema.safeParse(request.body);
    if (!parsed.success) {
        return reply
            .status(400)
            .send({ error: parsed.error.flatten().fieldErrors });
    }
    try {
        const result = await AuthService.signin(parsed.data);
        return reply.status(200).send(result);
    }
    catch (err) {
        return reply
            .status(err.statusCode ?? 500)
            .send({ error: err.message ?? "Internal server error" });
    }
}
// ── POST /api/auth/refresh ────────────────────────────────────
async function refreshHandler(request, reply) {
    const parsed = auth_schema_1.RefreshSchema.safeParse(request.body);
    if (!parsed.success) {
        return reply
            .status(400)
            .send({ error: parsed.error.flatten().fieldErrors });
    }
    try {
        const result = await AuthService.refreshTokens(parsed.data.refresh_token);
        return reply.status(200).send(result);
    }
    catch (err) {
        return reply
            .status(err.statusCode ?? 500)
            .send({ error: err.message ?? "Internal server error" });
    }
}
// ── POST /api/auth/logout ─────────────────────────────────────
async function logoutHandler(request, reply) {
    const user = request.user;
    const token = request.headers.authorization.slice(7);
    try {
        const result = await AuthService.logout(user.userId, token);
        return reply.status(200).send(result);
    }
    catch (err) {
        return reply.status(500).send({ error: "Logout failed" });
    }
}
// ── GET /api/auth/me ──────────────────────────────────────────
async function meHandler(request, reply) {
    // user is already attached by authenticate middleware
    const user = request.user;
    return reply.status(200).send({ user });
}
// ── POST /api/auth/forgot-password ────────────────────────────
async function forgotPasswordHandler(request, reply) {
    const parsed = auth_schema_1.forgotPasswordSchema.safeParse(request.body);
    if (!parsed.success) {
        return reply
            .status(400)
            .send({ error: parsed.error.flatten().fieldErrors });
    }
    try {
        await AuthService.sendForgotPasswordOtp(parsed.data);
        // Always 200 — no info leak
        return reply.status(200).send({
            message: "OTP sent if account exists",
        });
    }
    catch (err) {
        return reply
            .status(err.statusCode ?? 500)
            .send({ error: err.message ?? "Internal server error" });
    }
}
// ── POST /api/auth/verify-otp ─────────────────────────────────
async function verifyOtpHandler(request, reply) {
    const parsed = auth_schema_1.verifyOtpSchema.safeParse(request.body);
    if (!parsed.success) {
        return reply
            .status(400)
            .send({ error: parsed.error.flatten().fieldErrors });
    }
    try {
        await AuthService.verifyOtp(parsed.data);
        return reply.status(200).send({ message: "OTP verified" });
    }
    catch (err) {
        return reply
            .status(err.statusCode ?? 500)
            .send({ error: err.message ?? "Internal server error" });
    }
}
// ── POST /api/auth/reset-password ─────────────────────────────
async function resetPasswordHandler(request, reply) {
    const parsed = auth_schema_1.resetPasswordSchema.safeParse(request.body);
    if (!parsed.success) {
        return reply
            .status(400)
            .send({ error: parsed.error.flatten().fieldErrors });
    }
    try {
        await AuthService.resetPassword(parsed.data);
        return reply.status(200).send({ message: "Password reset successfully" });
    }
    catch (err) {
        return reply
            .status(err.statusCode ?? 500)
            .send({ error: err.message ?? "Internal server error" });
    }
}
//# sourceMappingURL=auth.controller.js.map