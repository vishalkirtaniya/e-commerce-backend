import { z } from "zod";

export const CreateAdminUserSchema = z.object({
  body: z.object({
    email: z.string().email(), // must match an existing user_credentials.email
    role_id: z.number().int().positive(),
  }),
});

export const AdminUserParamsSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export type CreateAdminUserBody = { email: string; role_id: number };
export type AdminUserParams = { id: string };
