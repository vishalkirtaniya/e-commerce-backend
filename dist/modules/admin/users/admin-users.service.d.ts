import type { CreateAdminUserBody } from "./admin-users.schema.js";
export declare function getAllAdminUsers(): Promise<{
    id: any;
    is_active: any;
    created_at: any;
    updated_at: any;
    credential_id: any;
    email: any;
    full_name: any;
    phone: any;
    admin_roles: {
        id: any;
        name: any;
        label: any;
    };
}[]>;
export declare function getAdminAuditLog(adminUserId: number): Promise<any[]>;
export declare function getAllRoles(): Promise<any[]>;
export declare function createAdminUser(body: CreateAdminUserBody): Promise<any>;
export declare function deactivateAdminUser(id: string): Promise<any>;
export declare function reactivateAdminUser(id: string): Promise<any>;
//# sourceMappingURL=admin-users.service.d.ts.map