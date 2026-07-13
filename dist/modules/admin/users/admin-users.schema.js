"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUserParamsSchema = exports.CreateAdminUserSchema = void 0;
const zod_1 = require("zod");
exports.CreateAdminUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(), // must match an existing user_credentials.email
        role_id: zod_1.z.number().int().positive(),
    }),
});
exports.AdminUserParamsSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string(),
    }),
});
//# sourceMappingURL=admin-users.schema.js.map