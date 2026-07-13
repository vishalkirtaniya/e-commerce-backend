import { z } from "zod";

export const SignupSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().optional(),
});

export const SigninSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const RefreshSchema = z.object({
  refresh_token: z.string().min(1, "Refresh token is required"),
});

// ── Forgot Password ─────────────────────────────────────────────
export const forgotPasswordSchema = z.object({
  email: z
    .string({ message: "Email is required" })
    .email("Invalid email address")
    .transform((v) => v.toLowerCase().trim()),
});

// ── Verify OTP ──────────────────────────────────────────────────
export const verifyOtpSchema = z.object({
  email: z
    .string({ message: "Email is required" })
    .email("Invalid email address")
    .transform((v) => v.toLowerCase().trim()),

  otp: z
    .string({ message: "OTP is required" })
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only digits"),
});

// ── Reset Password ──────────────────────────────────────────────
export const resetPasswordSchema = z.object({
  email: z
    .string({ message: "Email is required" })
    .email("Invalid email address")
    .transform((v) => v.toLowerCase().trim()),

  otp: z
    .string({ message: "OTP is required" })
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only digits"),

  new_password: z
    .string({ message: "Password is required" })
    .min(8, "Password must be at least 8 characters"),
});

// ── Inferred Types ──────────────────────────────────────────────
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export type SignupInput = z.infer<typeof SignupSchema>;
export type SigninInput = z.infer<typeof SigninSchema>;
export type RefreshInput = z.infer<typeof RefreshSchema>;
