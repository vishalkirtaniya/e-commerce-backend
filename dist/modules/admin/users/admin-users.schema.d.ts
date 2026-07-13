import { z } from "zod";
export declare const CreateAdminUserSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
        role_id: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const AdminUserParamsSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export type CreateAdminUserBody = {
    email: string;
    role_id: number;
};
export type AdminUserParams = {
    id: string;
};
//# sourceMappingURL=admin-users.schema.d.ts.map