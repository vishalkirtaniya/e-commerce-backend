import { z } from 'zod';
export declare const AdminLoginSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export type AdminLoginBody = {
    email: string;
    password: string;
};
//# sourceMappingURL=admin-auth.schema.d.ts.map