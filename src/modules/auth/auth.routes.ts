import { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/auth";
import {
  signupHandler,
  signinHandler,
  refreshHandler,
  logoutHandler,
  meHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
  verifyOtpHandler,
} from "./auth.controller";

export async function authRoutes(fastify: FastifyInstance) {
  // Public routes
  fastify.post("/signup", signupHandler);
  fastify.post("/signin", signinHandler);
  fastify.post("/refresh", refreshHandler);

  // Password reset (public)
  fastify.post("/forgot-password", forgotPasswordHandler);
  fastify.post("/verify-otp", verifyOtpHandler);
  fastify.post("/reset-password", resetPasswordHandler);

  // Protected routes
  fastify.post("/logout", { preHandler: [authenticate] }, logoutHandler);
  fastify.get("/me", { preHandler: [authenticate] }, meHandler);
}
