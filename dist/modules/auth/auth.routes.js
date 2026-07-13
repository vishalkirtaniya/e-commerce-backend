"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = authRoutes;
const auth_1 = require("../../middleware/auth");
const auth_controller_1 = require("./auth.controller");
async function authRoutes(fastify) {
    // Public routes
    fastify.post("/signup", auth_controller_1.signupHandler);
    fastify.post("/signin", auth_controller_1.signinHandler);
    fastify.post("/refresh", auth_controller_1.refreshHandler);
    // Password reset (public)
    fastify.post("/forgot-password", auth_controller_1.forgotPasswordHandler);
    fastify.post("/verify-otp", auth_controller_1.verifyOtpHandler);
    fastify.post("/reset-password", auth_controller_1.resetPasswordHandler);
    // Protected routes
    fastify.post("/logout", { preHandler: [auth_1.authenticate] }, auth_controller_1.logoutHandler);
    fastify.get("/me", { preHandler: [auth_1.authenticate] }, auth_controller_1.meHandler);
}
//# sourceMappingURL=auth.routes.js.map