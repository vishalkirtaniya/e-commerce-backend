"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminWithPermissions = getAdminWithPermissions;
// src/modules/admin/shared/admin.service.ts
const db_js_1 = __importDefault(require("../../../services/db.js"));
async function getAdminWithPermissions(credentialId) {
    try {
        const result = await db_js_1.default.query(`SELECT
        au.id,
        au.is_active,
        ar.name  AS role_name,
        ar.label AS role_label,
        ARRAY_AGG(ap.key) FILTER (WHERE ap.key IS NOT NULL) AS permissions
      FROM admin_users au
      JOIN admin_roles ar ON ar.id = au.role_id
      LEFT JOIN admin_role_permissions arp ON arp.role_id = ar.id
      LEFT JOIN admin_permissions ap ON ap.id = arp.permission_id
      WHERE au.credential_id = $1
      GROUP BY au.id, au.is_active, ar.name, ar.label`, [credentialId]);
        if (result.rows.length === 0)
            return null;
        const row = result.rows[0];
        if (!row.is_active)
            return null;
        return {
            adminUserId: row.id,
            role: {
                name: row.role_name,
                label: row.role_label,
            },
            permissions: new Set(row.permissions ?? []),
        };
    }
    catch (err) {
        console.error("[admin.service] DB error1:", err);
        return null;
    }
}
//# sourceMappingURL=admin.service.js.map