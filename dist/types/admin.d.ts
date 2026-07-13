export interface AdminRole {
    name: string;
    label: string;
}
export interface AdminUser {
    adminUserId: number;
    role: AdminRole;
    permissions: Set<string>;
}
export type PermissionKey = 'orders:read' | 'orders:write' | 'orders:refund' | 'products:read' | 'products:write' | 'products:delete' | 'users:read' | 'users:write' | 'analytics:read' | 'promo:read' | 'promo:write' | 'admin:manage';
export interface AuditLogParams {
    adminUserId: number;
    action: string;
    entity: string;
    entityId?: string | number;
    payload?: Record<string, unknown>;
    ipAddress?: string;
}
//# sourceMappingURL=admin.d.ts.map