"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminWithPermissions = getAdminWithPermissions;
// src/services/adminService.ts
const supabaseClient_js_1 = require("../lib/supabaseClient.js");
async function getAdminWithPermissions(credentialId) {
    const { data, error } = await supabaseClient_js_1.supabase
        .from('admin_users')
        .select(`
      id,
      is_active,
      admin_roles (
        id,
        name,
        label,
        admin_role_permissions (
          admin_permissions (
            key,
            module
          )
        )
      )
    `)
        .eq('credential_id', credentialId)
        .maybeSingle(); // ← use maybeSingle() instead of single() — returns null instead of error when no row found
    if (error) {
        console.error('[getAdminWithPermissions] DB error:', error.message);
        return null;
    }
    if (!data || !data.is_active)
        return null;
    const row = data;
    if (!row.admin_roles)
        return null;
    const permissions = new Set(row.admin_roles.admin_role_permissions
        .map((rp) => rp.admin_permissions?.key)
        .filter((key) => key !== undefined));
    return {
        adminUserId: row.id,
        role: {
            name: row.admin_roles.name,
            label: row.admin_roles.label,
        },
        permissions,
    };
}
//# sourceMappingURL=adminService.js.map