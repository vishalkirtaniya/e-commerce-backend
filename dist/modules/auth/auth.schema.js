"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.verifyOtpSchema = exports.forgotPasswordSchema = exports.RefreshSchema = exports.SigninSchema = exports.SignupSchema = void 0;
const zod_1 = require("zod");
exports.SignupSchema = zod_1.z.object({
    full_name: zod_1.z.string().min(2, "Name must be at least 2 characters"),
    email: zod_1.z.email("Invalid email address"),
    password: zod_1.z.string().min(8, "Password must be at least 8 characters"),
    phone: zod_1.z.string().optional(),
});
exports.SigninSchema = zod_1.z.object({
    email: zod_1.z.email("Invalid email address"),
    password: zod_1.z.string().min(1, "Password is required"),
});
exports.RefreshSchema = zod_1.z.object({
    refresh_token: zod_1.z.string().min(1, "Refresh token is required"),
});
// ── Forgot Password ─────────────────────────────────────────────
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z
        .string({ message: "Email is required" })
        .email("Invalid email address")
        .transform((v) => v.toLowerCase().trim()),
});
// ── Verify OTP ──────────────────────────────────────────────────
exports.verifyOtpSchema = zod_1.z.object({
    email: zod_1.z
        .string({ message: "Email is required" })
        .email("Invalid email address")
        .transform((v) => v.toLowerCase().trim()),
    otp: zod_1.z
        .string({ message: "OTP is required" })
        .length(6, "OTP must be exactly 6 digits")
        .regex(/^\d{6}$/, "OTP must contain only digits"),
});
// ── Reset Password ──────────────────────────────────────────────
exports.resetPasswordSchema = zod_1.z.object({
    email: zod_1.z
        .string({ message: "Email is required" })
        .email("Invalid email address")
        .transform((v) => v.toLowerCase().trim()),
    otp: zod_1.z
        .string({ message: "OTP is required" })
        .length(6, "OTP must be exactly 6 digits")
        .regex(/^\d{6}$/, "OTP must contain only digits"),
    new_password: zod_1.z
        .string({ message: "Password is required" })
        .min(8, "Password must be at least 8 characters"),
});
//# sourceMappingURL=auth.schema.js.map