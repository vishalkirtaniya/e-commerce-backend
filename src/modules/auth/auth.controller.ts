import { FastifyRequest, FastifyReply } from "fastify";
import {
  SignupSchema,
  SigninSchema,
  RefreshSchema,
  resetPasswordSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
} from "./auth.schema";
import * as AuthService from "./auth.service";

// ── POST /api/auth/signup ─────────────────────────────────────
export async function signupHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const parsed = SignupSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply
      .status(400)
      .send({ error: parsed.error.flatten().fieldErrors });
  }

  try {
    const result = await AuthService.signup(parsed.data);
    return reply.status(201).send(result);
  } catch (err: any) {
    return reply
      .status(err.statusCode ?? 500)
      .send({ error: err.message ?? "Internal server error" });
  }
}

// ── POST /api/auth/signin ─────────────────────────────────────
export async function signinHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const parsed = SigninSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply
      .status(400)
      .send({ error: parsed.error.flatten().fieldErrors });
  }

  try {
    const result = await AuthService.signin(parsed.data);
    return reply.status(200).send(result);
  } catch (err: any) {
    return reply
      .status(err.statusCode ?? 500)
      .send({ error: err.message ?? "Internal server error" });
  }
}

// ── POST /api/auth/refresh ────────────────────────────────────
export async function refreshHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const parsed = RefreshSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply
      .status(400)
      .send({ error: parsed.error.flatten().fieldErrors });
  }

  try {
    const result = await AuthService.refreshTokens(parsed.data.refresh_token);
    return reply.status(200).send(result);
  } catch (err: any) {
    return reply
      .status(err.statusCode ?? 500)
      .send({ error: err.message ?? "Internal server error" });
  }
}

// ── POST /api/auth/logout ─────────────────────────────────────
export async function logoutHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const user = (request as any).user;
  const token = request.headers.authorization!.slice(7);

  try {
    const result = await AuthService.logout(user.userId, token);
    return reply.status(200).send(result);
  } catch (err: any) {
    return reply.status(500).send({ error: "Logout failed" });
  }
}

// ── GET /api/auth/me ──────────────────────────────────────────
export async function meHandler(request: FastifyRequest, reply: FastifyReply) {
  // user is already attached by authenticate middleware
  const user = (request as any).user;
  return reply.status(200).send({ user });
}

// ── POST /api/auth/forgot-password ────────────────────────────
export async function forgotPasswordHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const parsed = forgotPasswordSchema.safeParse(request.body);

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
  } catch (err: any) {
    return reply
      .status(err.statusCode ?? 500)
      .send({ error: err.message ?? "Internal server error" });
  }
}

// ── POST /api/auth/verify-otp ─────────────────────────────────
export async function verifyOtpHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const parsed = verifyOtpSchema.safeParse(request.body);

  if (!parsed.success) {
    return reply
      .status(400)
      .send({ error: parsed.error.flatten().fieldErrors });
  }

  try {
    await AuthService.verifyOtp(parsed.data);

    return reply.status(200).send({ message: "OTP verified" });
  } catch (err: any) {
    return reply
      .status(err.statusCode ?? 500)
      .send({ error: err.message ?? "Internal server error" });
  }
}

// ── POST /api/auth/reset-password ─────────────────────────────
export async function resetPasswordHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const parsed = resetPasswordSchema.safeParse(request.body);

  if (!parsed.success) {
    return reply
      .status(400)
      .send({ error: parsed.error.flatten().fieldErrors });
  }

  try {
    await AuthService.resetPassword(parsed.data);

    return reply.status(200).send({ message: "Password reset successfully" });
  } catch (err: any) {
    return reply
      .status(err.statusCode ?? 500)
      .send({ error: err.message ?? "Internal server error" });
  }
}
