"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = authRoutes;
const auth_controller_1 = require("./auth.controller");
async function authRoutes(app) {
    app.post("/auth/signup", auth_controller_1.signup);
    app.post("/auth/login", auth_controller_1.login);
    app.post("/auth/logout", auth_controller_1.logout);
}
