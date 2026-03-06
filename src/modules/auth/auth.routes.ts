import { FastifyInstance } from "fastify";
import { signup, login, logout } from "./auth.controller";

export default async function authRoutes(app: FastifyInstance) {
  app.post("/auth/signup", signup);

  app.post("/auth/login", login);

  app.post("/auth/logout", logout);
}
